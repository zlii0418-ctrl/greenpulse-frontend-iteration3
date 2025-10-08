import { defineStore } from 'pinia'
import { greenPlaceApiService } from '../services/greenPlaceApi'

// Debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const useGreenPlaceStore = defineStore('greenPlace', {
  state: () => ({
    // Search related state
    searchResults: [],
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,
    isLoading: false,
    searchKeyword: '',
    
    // Detail related state
    selectedPlace: null,
    isDetailLoading: false,
    
    // User location related state
    userLocation: null,
    locationPermission: 'prompt', // 'granted', 'denied', 'prompt'
    isGettingLocation: false,
    
    // Error state
    error: null,
    
    // Debounce related state
    searchDebounceTimer: null,
    
    // Cache related state
    mapDataCache: null,
    mapDataCacheTime: null,
    cacheExpiry: 5 * 60 * 1000 // 5 minutes cache expiry
  }),

  getters: {
    // Whether there are search results
    hasResults: (state) => state.searchResults.length > 0,
    
    // Whether currently loading
    isSearching: (state) => state.isLoading,
    
    // Whether currently loading details
    isLoadingDetail: (state) => state.isDetailLoading,
    
    // Whether there is an error
    hasError: (state) => state.error !== null
  },

  actions: {
    /**
     * Fetch all places for map display (does not change pagination list state)
     * With cache mechanism to avoid duplicate requests
     */
    async loadAllForMap() {
      try {
        // Check if cache is valid
        if (this.mapDataCache && this.mapDataCacheTime && 
            (Date.now() - this.mapDataCacheTime) < this.cacheExpiry) {
          console.log('Using cached map data, total', this.mapDataCache.length, 'places')
          return this.mapDataCache
        }
        
        console.log('Starting to load map data...')
        // Reduce request count to avoid timeout
        const resp = await greenPlaceApiService.searchPlaces({ keyword: '', page: 0, size: 500 })
        console.log('API response:', resp)
        
        if (resp && Array.isArray(resp.content)) {
          console.log('Successfully loaded', resp.content.length, 'places')
          console.log('First few places data:', resp.content.slice(0, 3))
          
          // Cache data
          this.mapDataCache = resp.content
          this.mapDataCacheTime = Date.now()
          
          return resp.content
        } else {
          console.warn('API response format abnormal:', resp)
          return []
        }
      } catch (error) {
        console.error('Failed to load all places:', error)
        console.error('Error details:', error.response || error.message)
        
        // If API fails but has cache, return cached data
        if (this.mapDataCache) {
          console.log('API failed, using cached data')
          return this.mapDataCache
        }
        
        return []
      }
    },
    /**
     * Search green places (with debounce)
     * @param {Object} params - Search parameters
     * @param {string} params.keyword - Search keyword
     * @param {number} params.page - Page number (starting from 0)
     * @param {number} params.size - Page size
     * @param {boolean} params.immediate - Whether to execute immediately (skip debounce)
     */
    searchPlaces({ keyword = '', page = 0, size = 10, immediate = false } = {}) {
      if (immediate) {
        return this._performSearch({ keyword, page, size })
      }
      
      // Clear previous debounce timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      
      // Set new debounce timer
      this.searchDebounceTimer = setTimeout(() => {
        this._performSearch({ keyword, page, size })
      }, 300) // 300ms debounce delay
    },
    
    /**
     * Internal method to perform actual search
     */
    async _performSearch({ keyword = '', page = 0, size = 10 } = {}) {
      try {
        this.isLoading = true
        this.error = null
        
        const response = await greenPlaceApiService.searchPlaces({
          keyword,
          page,
          size
        })
        
        this.searchResults = response.content || []
        this.totalPages = response.totalPages || 0
        this.currentPage = response.currentPage || 0
        this.totalElements = response.totalElements || 0
        this.searchKeyword = keyword
        
      } catch (error) {
        console.error('Search failed:', error)
        this.error = 'Search failed, please try again later'
        this.searchResults = []
        this.totalPages = 0
        this.currentPage = 0
        this.totalElements = 0
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Load place details by ID
     * @param {number} id - Place ID
     */
    async loadById(id) {
      try {
        this.isDetailLoading = true
        this.error = null
        
        const response = await greenPlaceApiService.getPlaceById(id)
        this.selectedPlace = response
        
      } catch (error) {
        console.error('Failed to load details:', error)
        this.error = 'Failed to load details, please try again later'
        this.selectedPlace = null
      } finally {
        this.isDetailLoading = false
      }
    },

    /**
     * Clear search state
     */
    clearSearch() {
      this.searchResults = []
      this.totalPages = 0
      this.currentPage = 0
      this.totalElements = 0
      this.searchKeyword = ''
      this.error = null
    },

    /**
     * Clear detail state
     */
    clearDetail() {
      this.selectedPlace = null
      this.error = null
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },

    /**
     * Get user current location
     */
    async getUserLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Your browser does not support geolocation functionality'))
          return
        }

        this.isGettingLocation = true
        this.error = null

        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.isGettingLocation = false
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
            this.locationPermission = 'granted'
            resolve(this.userLocation)
          },
          (error) => {
            this.isGettingLocation = false
            this.locationPermission = 'denied'
            
            let errorMessage = 'Failed to get location'
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'User denied location permission request'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable'
                break
              case error.TIMEOUT:
                errorMessage = 'Location request timeout'
                break
              default:
                errorMessage = 'Unknown error occurred while getting location'
                break
            }
            
            this.error = errorMessage
            reject(new Error(errorMessage))
          },
          options
        )
      })
    },

    /**
     * Request location permission
     */
    async requestLocationPermission() {
      try {
        await this.getUserLocation()
        return true
      } catch (error) {
        console.error('Location permission request failed:', error)
        return false
      }
    },

    /**
     * Clear user location information
     */
    clearUserLocation() {
      this.userLocation = null
      this.locationPermission = 'prompt'
      this.isGettingLocation = false
    }
  }
})