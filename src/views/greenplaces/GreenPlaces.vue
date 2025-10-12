<template>
  <div class="home-view h-screen flex flex-col">
    <!-- Header -->
    <Header />

    <!-- Back Button -->
    <div class="bg-white border-b border-gray-200 px-4 py-2">
      <button
        @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back
      </button>
    </div>

    <!-- Mode Toggle Bar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center gap-4">
        <div class="flex-1 flex gap-2">
          <button
            @click="handleModeChange('search')"
            :class="viewMode === 'search' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Search Places
          </button>
          <button
            @click="handleModeChange('routing')"
            :class="viewMode === 'routing' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            Route Comparison
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar (only visible in search mode) -->
    <SearchBar
      v-if="viewMode === 'search'"
      v-model="searchKeyword"
      :selected-category="selectedCategory"
      :categories="categories"
      :is-searching="isSearching"
      @search="handleSearch"
      @update:selectedCategory="selectedCategory = $event"
    />
    
    <!-- Main content area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left side results list / routing panel -->
      <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <!-- Search Mode -->
        <template v-if="viewMode === 'search'">
          <!-- Results title -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-900">
              Search Results
              <span v-if="totalElements > 0" class="text-sm font-normal text-gray-500">
                ({{ totalElements }} results)
              </span>
            </h2>
          </div>
          
          <!-- Results list -->
          <div class="flex-1 overflow-y-auto">
          <!-- Loading state -->
          <div v-if="isSearching" class="p-4 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p class="text-gray-600">Searching...</p>
          </div>
          
          <!-- Error state -->
          <div v-else-if="hasError" class="p-4 text-center">
            <div class="text-red-500 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <button
              @click="retrySearch"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
          
          <!-- No results -->
          <div v-else-if="!hasResults && !isSearching" class="p-4 text-center">
            <div class="text-gray-400 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <p class="text-gray-600">No search results found</p>
            <p class="text-sm text-gray-500 mt-1">Please try other keywords</p>
          </div>
          
          <!-- Results list -->
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="place in searchResults"
              :key="place.id"
              @click="selectPlace(place)"
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{ 'bg-green-50 border-r-4 border-green-500': selectedPlaceId === place.id }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 mb-1">{{ place.name }}</h3>
                  
                  <!-- Category -->
                  <div v-if="place.category" class="mb-2">
                    <span class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {{ place.category }}
                    </span>
                  </div>
                  
                  <!-- Rating -->
                  <div class="flex items-center mb-2">
                    <div class="flex items-center">
                      <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= getRatingStars(place.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <span class="ml-1 text-xs text-gray-600">
                      {{ place.rating ? place.rating.toFixed(1) : 'No rating' }}
                    </span>
                  </div>
                  
                  <!-- Address -->
                  <p class="text-sm text-gray-600 line-clamp-2">{{ place.fullAddress }}</p>
                </div>
                
                <!-- Arrow icon -->
                <svg class="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="p-4 border-t border-gray-200 bg-white">
          <div class="flex items-center justify-between gap-3">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 0"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>
            
            <span class="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </span>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages - 1"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              Next
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          </div>
        </template>

        <!-- Routing Mode -->
        <template v-if="viewMode === 'routing'">
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-900">
              Route Comparison
            </h2>
            <p class="text-xs text-gray-600 mt-1">Compare carbon emissions across transport modes</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <RouteComparison
              ref="routeComparisonRef"
              :user-location="greenPlaceStore.userLocation"
              :vehicle-data-freshness="vehicleDataFreshness"
              @location-select-start="handleLocationSelectStart"
              @location-selected="handleLocationSelected"
              @route-selected="handleRouteSelected"
              @vehicle-tracking-toggle="handleVehicleTrackingToggle"
            />
          </div>
        </template>
      </div>
      
      <!-- Right side map -->
      <div class="w-2/3 relative">
        <GoogleMap
          ref="googleMapRef"
          :places="mapPlaces"
          :center="mapCenter"
          :zoom="mapZoom"
          :user-location="greenPlaceStore.userLocation"
          :selected-place-id="selectedPlaceId"
          :routing-data="routingData"
          :routing-mode="viewMode === 'routing'"
          @place-click="selectPlace"
          @map-click="handleMapClick"
          @vehicle-data-freshness="handleVehicleDataFreshness"
        />
      </div>
    </div>
    
    <!-- Detail drawer -->
    <PlaceDetailDrawer
      :is-open="isDetailDrawerOpen"
      :place="selectedPlace"
      :is-loading="isDetailLoading"
      :error="detailError"
      @close="closeDetailDrawer"
      @retry="retryLoadDetail"
    />
    
    <!-- Location permission request modal -->
    <LocationPermissionModal
      :is-open="showLocationModal"
      :is-getting-location="greenPlaceStore.isGettingLocation"
      :error="greenPlaceStore.error"
      @close="handleLocationModalClose"
      @allow="handleLocationAllow"
      @deny="handleLocationDeny"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGreenPlaceStore } from '../../stores/greenPlace'
import Header from '../components/header.vue'
import SearchBar from './components/SearchBar.vue'
import GoogleMap from './components/GoogleMap.vue'
import PlaceDetailDrawer from './components/PlaceDetailDrawer.vue'
import LocationPermissionModal from './components/LocationPermissionModal.vue'
import RouteComparison from './components/RouteComparison.vue'

// Use Pinia store
const greenPlaceStore = useGreenPlaceStore()
const router = useRouter()

// Reactive data
const viewMode = ref('search') // 'search' or 'routing'
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedPlaceId = ref(null)
const isDetailDrawerOpen = ref(false)
const mapCenter = ref({ lat: 3.1390, lng: 101.6869 }) // Default Kuala Lumpur
const mapZoom = ref(12)
const mapPlaces = ref([])
const showLocationModal = ref(false)
const routeComparisonRef = ref(null)
const googleMapRef = ref(null)
const routingData = ref(null) // Store routing origin, destination, and route data
const vehicleDataFreshness = ref(null) // Store vehicle data freshness info

// Computed properties
const searchResults = computed(() => greenPlaceStore.searchResults)
const totalPages = computed(() => greenPlaceStore.totalPages)
const currentPage = computed(() => greenPlaceStore.currentPage)
const totalElements = computed(() => greenPlaceStore.totalElements)
const isSearching = computed(() => greenPlaceStore.isSearching)
const hasResults = computed(() => greenPlaceStore.hasResults)
const hasError = computed(() => greenPlaceStore.hasError)
const error = computed(() => greenPlaceStore.error)
const selectedPlace = computed(() => greenPlaceStore.selectedPlace)
const isDetailLoading = computed(() => greenPlaceStore.isDetailLoading)
const detailError = computed(() => greenPlaceStore.error)
const categories = computed(() => greenPlaceStore.categories)

// Methods
const handleSearch = (searchParams) => {
  // Handle both old string format and new object format for backward compatibility
  if (typeof searchParams === 'string') {
    searchKeyword.value = searchParams
    greenPlaceStore.searchPlaces({
      keyword: searchParams,
      category: selectedCategory.value,
      page: 0,
      size: 10
    })
  } else {
    searchKeyword.value = searchParams.keyword
    selectedCategory.value = searchParams.category
    greenPlaceStore.searchPlaces({
      keyword: searchParams.keyword,
      category: searchParams.category,
      page: 0,
      size: 10
    })
  }
}

const selectPlace = async (place) => {
  selectedPlaceId.value = place.id
  isDetailDrawerOpen.value = true
  
  // Update map center to selected place location
  if (place.latitude && place.longitude) {
    mapCenter.value = {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude)
    }
    mapZoom.value = 15 // Set appropriate zoom level for place details
  }
  
  // Load details
  await greenPlaceStore.loadById(place.id)
}

const closeDetailDrawer = () => {
  isDetailDrawerOpen.value = false
  selectedPlaceId.value = null
  greenPlaceStore.clearDetail()
}

const retryLoadDetail = () => {
  if (selectedPlaceId.value) {
    greenPlaceStore.loadById(selectedPlaceId.value)
  }
}

const retrySearch = () => {
  handleSearch({
    keyword: searchKeyword.value,
    category: selectedCategory.value
  })
}

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    greenPlaceStore.searchPlaces({
      keyword: searchKeyword.value,
      category: selectedCategory.value,
      page,
      size: 10
    })
  }
}

const getRatingStars = (rating) => {
  if (!rating) return 0
  return Math.round(rating)
}

const goBack = () => {
  router.go(-1)
}

// Location permission related methods
const handleLocationModalClose = () => {
  showLocationModal.value = false
}

const handleLocationAllow = async () => {
  try {
    const success = await greenPlaceStore.requestLocationPermission()
    if (success && greenPlaceStore.userLocation) {
      // Location obtained successfully, center and zoom map to user location
      console.log('User granted location, centering map:', greenPlaceStore.userLocation)
      mapCenter.value = {
        lat: greenPlaceStore.userLocation.lat,
        lng: greenPlaceStore.userLocation.lng
      }
      mapZoom.value = 13 // Zoom in on user location
    }
    showLocationModal.value = false
  } catch (error) {
    console.error('Failed to get location:', error)
  }
}

const handleLocationDeny = () => {
  showLocationModal.value = false
  greenPlaceStore.locationPermission = 'denied'
  localStorage.setItem('locationPermission', 'denied')
}

// Routing-related methods
const handleLocationSelectStart = (type) => {
  console.log('Starting location selection for:', type)
  // You can add visual feedback here if needed
}

const handleMapClick = ({ lat, lng }) => {
  // Check if RouteComparison is expecting a location selection
  if (routeComparisonRef.value && routeComparisonRef.value.selectingFor) {
    const selectingFor = routeComparisonRef.value.selectingFor
    routeComparisonRef.value.setLocation(selectingFor, lat, lng)
  }
}

const handleLocationSelected = ({ type, lat, lng }) => {
  console.log(`Location selected for ${type}:`, lat, lng)
  // Update map center to show the selected location
  mapCenter.value = { lat, lng }
  mapZoom.value = 13
  
  // Update routing data to show markers immediately
  if (!routingData.value) {
    routingData.value = { origin: null, destination: null, selectedRoute: null }
  }
  
  if (type === 'origin') {
    routingData.value.origin = { latitude: lat, longitude: lng }
  } else if (type === 'destination') {
    routingData.value.destination = { latitude: lat, longitude: lng }
  }
  
  // Trigger reactivity by creating a new object
  routingData.value = { ...routingData.value }
}

const handleRouteSelected = (data) => {
  console.log('Route selected:', data)
  // Pass the entire data including the selected scenario route and real-time vehicles
  routingData.value = {
    origin: data.origin,
    destination: data.destination,
    selectedRoute: data.scenario,  // Include the selected route/scenario
    realtimeVehicles: data.realtimeVehicles || null  // Include real-time vehicle data
  }
  
  // Update map to show both origin and destination
  if (data.origin && data.destination) {
    // Calculate center point between origin and destination
    const centerLat = (data.origin.latitude + data.destination.latitude) / 2
    const centerLng = (data.origin.longitude + data.destination.longitude) / 2
    mapCenter.value = { lat: centerLat, lng: centerLng }
    
    // Adjust zoom based on distance
    const latDiff = Math.abs(data.origin.latitude - data.destination.latitude)
    const lngDiff = Math.abs(data.origin.longitude - data.destination.longitude)
    const maxDiff = Math.max(latDiff, lngDiff)
    
    if (maxDiff < 0.01) mapZoom.value = 14
    else if (maxDiff < 0.05) mapZoom.value = 12
    else if (maxDiff < 0.1) mapZoom.value = 11
    else mapZoom.value = 10
  }
}

const handleVehicleTrackingToggle = (data) => {
  console.log('🔔 Vehicle tracking toggle event received:', data.action)
  
  if (!googleMapRef.value) {
    console.error('❌ GoogleMap ref not available!')
    return
  }
  
  if (data.action === 'start') {
    // Start vehicle tracking
    console.log('🚌 Starting vehicle tracking on map with routes:', data.routes)
    googleMapRef.value.startVehicleTracking(data.routes, data.vehicleData)
  } else if (data.action === 'stop') {
    // Stop vehicle tracking
    console.log('🛑 Calling stopVehicleTracking on GoogleMap component')
    try {
      googleMapRef.value.stopVehicleTracking()
      console.log('✅ GoogleMap stopVehicleTracking called successfully')
    } catch (error) {
      console.error('❌ Error stopping vehicle tracking:', error)
    }
  }
}

const handleVehicleDataFreshness = (freshnessData) => {
  vehicleDataFreshness.value = freshnessData
  console.log('📊 Vehicle data freshness updated:', freshnessData.message)
}

const handleModeChange = (newMode) => {
  // Stop vehicle tracking when switching modes
  if (viewMode.value === 'routing' && newMode === 'search') {
    if (googleMapRef.value) {
      googleMapRef.value.stopVehicleTracking()
    }
  }
  
  viewMode.value = newMode
}

// Check if geolocation is supported and permission state
const checkLocationSupport = async () => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by this browser')
    return false
  }

  // Check permission state using Permissions API if available
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
      console.log('Geolocation permission state:', permissionStatus.state)
      
      // Listen for permission changes
      permissionStatus.addEventListener('change', () => {
        console.log('Geolocation permission changed to:', permissionStatus.state)
        if (permissionStatus.state === 'granted') {
          greenPlaceStore.locationPermission = 'granted'
          localStorage.setItem('locationPermission', 'granted')
          // Auto-get location when permission is granted and zoom to it
          greenPlaceStore.requestLocationPermission().then((success) => {
            if (success && greenPlaceStore.userLocation) {
              console.log('Permission granted, zooming to user location:', greenPlaceStore.userLocation)
              mapCenter.value = {
                lat: greenPlaceStore.userLocation.lat,
                lng: greenPlaceStore.userLocation.lng
              }
              mapZoom.value = 13
            }
          })
        } else if (permissionStatus.state === 'denied') {
          greenPlaceStore.locationPermission = 'denied'
          localStorage.setItem('locationPermission', 'denied')
          // Reset to default location when permission is denied
          console.log('Permission denied, using default location')
          mapCenter.value = { lat: 3.1390, lng: 101.6869 }
          mapZoom.value = 12
        }
      })
      
      // Update store based on browser permission state
      if (permissionStatus.state === 'granted') {
        greenPlaceStore.locationPermission = 'granted'
        localStorage.setItem('locationPermission', 'granted')
        return true
      } else if (permissionStatus.state === 'denied') {
        greenPlaceStore.locationPermission = 'denied'
        localStorage.setItem('locationPermission', 'denied')
        return false
      }
      // If 'prompt', we'll show the modal
      return true
    } catch (error) {
      console.log('Permissions API not fully supported:', error)
      return true // Show modal as fallback
    }
  }
  
  return true // If Permissions API not available, show modal
}

// Automatically load first page data when component mounts
onMounted(async () => {
  // Check if location services are available
  const isLocationAvailable = await checkLocationSupport()
  
  if (!isLocationAvailable) {
    console.log('Location services not available or denied')
  } else {
    // Only show location permission modal if permission hasn't been determined yet
    if (greenPlaceStore.locationPermission === 'prompt') {
      showLocationModal.value = true
    } else if (greenPlaceStore.locationPermission === 'granted') {
      // If permission was granted, try to get location silently
      if (!greenPlaceStore.userLocation) {
        await greenPlaceStore.requestLocationPermission()
      }
      
      // Center map on user location if available
      if (greenPlaceStore.userLocation) {
        console.log('Centering map on user location:', greenPlaceStore.userLocation)
        mapCenter.value = {
          lat: greenPlaceStore.userLocation.lat,
          lng: greenPlaceStore.userLocation.lng
        }
        mapZoom.value = 13
      }
    }
  }
  
  // Execute all initialization operations in parallel
  const initPromises = [
    // Load categories
    greenPlaceStore.loadCategories(),
    
    // Search operation
    Promise.resolve(handleSearch('')),
    
    // Map data loading
    (async () => {
      console.log('Starting to load map data...')
      const data = await greenPlaceStore.loadAllForMap()
      console.log('Map data loading completed, total', data.length, 'places')
      console.log('Map data:', data)
      return data
    })()
  ]
  
  // Wait for all initialization operations to complete
  const [, , mapData] = await Promise.all(initPromises)
  mapPlaces.value = mapData
  
  // Final check: If we still don't have a custom center and user location is available, use it
  if (greenPlaceStore.userLocation && 
      mapCenter.value.lat === 3.1390 && 
      mapCenter.value.lng === 101.6869) {
    console.log('Final map center adjustment to user location')
    mapCenter.value = {
      lat: greenPlaceStore.userLocation.lat,
      lng: greenPlaceStore.userLocation.lng
    }
    mapZoom.value = 13
  }
})

// Cleanup when leaving the page
onUnmounted(() => {
  console.log('🧹 GreenPlaces component unmounting - cleaning up...')
  
  // Stop vehicle tracking if active
  if (googleMapRef.value) {
    try {
      console.log('🛑 Stopping vehicle tracking on unmount')
      googleMapRef.value.stopVehicleTracking()
      console.log('✅ Vehicle tracking stopped on unmount')
    } catch (error) {
      console.error('❌ Error stopping vehicle tracking on unmount:', error)
    }
  }
})
</script>

<style scoped>
.home-view {
  padding-top: 80px; /* Fixed header spacing */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar styling */
:deep(*::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(*::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .home-view {
    padding-top: 70px; /* Mobile header height */
  }
}
</style>