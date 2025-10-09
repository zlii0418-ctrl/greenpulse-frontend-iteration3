<template>
  <div class="home-view h-screen flex flex-col">
    <!-- Search Bar -->
    <SearchBar
      v-model="searchKeyword"
      :selected-category="selectedCategory"
      :categories="categories"
      :is-searching="isSearching"
      @search="handleSearch"
      @update:selectedCategory="selectedCategory = $event"
    />
    
    <!-- Main content area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left side results list -->
      <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
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
        <div v-if="totalPages > 1" class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 0"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span class="text-sm text-gray-600">
              Page {{ currentPage + 1 }} of {{ totalPages }}
            </span>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages - 1"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <!-- Right side map -->
      <div class="w-2/3 relative">
        <GoogleMap
          :places="mapPlaces"
          :center="mapCenter"
          :zoom="mapZoom"
          :user-location="greenPlaceStore.userLocation"
          :selected-place-id="selectedPlaceId"
          @place-click="selectPlace"
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
import { ref, onMounted, computed } from 'vue'
import { useGreenPlaceStore } from '../../stores/greenPlace'
import SearchBar from './components/SearchBar.vue'
import GoogleMap from './components/GoogleMap.vue'
import PlaceDetailDrawer from './components/PlaceDetailDrawer.vue'
import LocationPermissionModal from './components/LocationPermissionModal.vue'

// Use Pinia store
const greenPlaceStore = useGreenPlaceStore()

// Reactive data
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedPlaceId = ref(null)
const isDetailDrawerOpen = ref(false)
const mapCenter = ref({ lat: 39.9042, lng: 116.4074 }) // Default Beijing
const mapZoom = ref(10)
const mapPlaces = ref([])
const showLocationModal = ref(false)

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

// Location permission related methods
const handleLocationModalClose = () => {
  showLocationModal.value = false
}

const handleLocationAllow = async () => {
  try {
    const success = await greenPlaceStore.requestLocationPermission()
    if (success && greenPlaceStore.userLocation) {
      // Location obtained successfully, adjust map center
      mapCenter.value = {
        lat: greenPlaceStore.userLocation.lat,
        lng: greenPlaceStore.userLocation.lng
      }
      mapZoom.value = 12 // Moderate zoom level, showing green places near user location without being too close
    }
    showLocationModal.value = false
  } catch (error) {
    console.error('Failed to get location:', error)
  }
}

const handleLocationDeny = () => {
  showLocationModal.value = false
  greenPlaceStore.locationPermission = 'denied'
}


// Automatically load first page data when component mounts
onMounted(async () => {
  // Immediately show location permission request modal, don't wait for other operations
  showLocationModal.value = true
  
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
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>