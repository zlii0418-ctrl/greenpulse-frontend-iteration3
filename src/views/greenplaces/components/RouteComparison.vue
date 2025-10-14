<template>
  <div class="route-comparison flex flex-col" style="scroll-behavior: smooth;">
    <!-- Region Info - Moved to top -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs mb-4">
      <div class="flex items-start gap-2">
        <span class="text-blue-600 text-base">ℹ️</span>
        <div class="text-blue-800">
          <span class="font-semibold">Public transport routing available in KL & Selangor only</span>
        </div>
      </div>
    </div>

    <!-- Location Inputs with Side Swap Button -->
    <div class="flex gap-2 mb-4">
      <!-- Input Container -->
      <div class="flex-1 space-y-3">
        <!-- Origin Section -->
        <div class="location-section">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-gray-700">Origin</h3>
            <button
              v-if="canUseGPS"
              @click="useCurrentLocation('origin')"
              :disabled="isGettingLocation"
              class="text-xs px-2.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ isGettingLocation ? 'Getting...' : (props.userLocation ? 'GPS' : 'KL') }}
            </button>
          </div>
          <div class="relative">
            <input
              ref="originInput"
              v-model="origin.name"
              type="text"
              placeholder="Your location"
              class="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              @focus="onOriginFocus"
            />
            <button
              v-if="origin.name"
              @click="clearOrigin"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear origin"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Destination Section -->
        <div class="location-section">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-gray-700">Destination</h3>
          </div>
          <div class="relative">
            <input
              ref="destinationInput"
              v-model="destination.name"
              type="text"
              placeholder="Where to?"
              class="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              @focus="onDestinationFocus"
            />
            <button
              v-if="destination.name"
              @click="clearDestination"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear destination"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Swap Button - Side Position -->
      <div class="flex items-center pt-6">
        <button
          @click="swapLocations"
          :disabled="!origin.latitude && !destination.latitude"
          class="group bg-white hover:bg-green-50 disabled:bg-gray-50 border-2 border-gray-300 hover:border-green-500 disabled:border-gray-200 text-gray-700 hover:text-green-600 disabled:text-gray-400 rounded-lg p-2.5 transition-all disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          title="Swap origin and destination"
        >
          <svg class="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Compare Button -->
    <div class="mb-4">
      <button
        @click="handleCompare"
        :disabled="!canCompare || isLoading"
        class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ isLoading ? 'Finding Routes...' : 'Find All Routes' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="results && !showingDetails" class="mt-4">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-3 mb-4">
        <div class="bg-green-50 p-3 rounded-lg">
          <div class="text-xs text-gray-600">Route Distance</div>
          <div class="text-xl font-bold text-green-600">
            {{ results.routeDistance?.toFixed(2) || '0.00' }} km
          </div>
        </div>
        <div class="bg-blue-50 p-3 rounded-lg">
          <div class="text-xs text-gray-600">Best Option</div>
          <div class="text-sm font-bold text-blue-600">
            {{ results.bestOption?.name || 'N/A' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ results.bestOption?.emissions?.toFixed(3) || '0.000' }} kg CO2
          </div>
        </div>
      </div>

      <!-- Sorting Options -->
      <div class="mb-4">
        <h3 class="text-xs font-semibold text-gray-600 mb-2">Sort By:</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            @click="setSortOption(option.value)"
            class="px-3 py-1.5 text-xs rounded-full font-medium transition-all"
            :class="currentSortOption === option.value 
              ? 'bg-green-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ option.icon }} {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Routes List -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">
          Transport Options
          <span class="text-xs font-normal text-gray-500">({{ sortedScenarios.length }} routes)</span>
        </h3>
        <div
          v-for="scenario in sortedScenarios"
          :key="scenario.id"
          @click="selectRoute(scenario)"
          class="route-card bg-white border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
          :class="{ 'border-green-500 bg-green-50': selectedRouteId === scenario.id }"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl">{{ getIcon(scenario.mode) }}</span>
                <div>
                  <div class="font-semibold text-sm text-gray-900">{{ scenario.name }}</div>
                  <div class="text-xs text-gray-500 capitalize">{{ scenario.category }}</div>
                  <div v-if="scenario.mode === 'transit' && getTransitSummary(scenario)" class="text-xs text-blue-600 font-medium mt-0.5">
                    {{ getTransitSummary(scenario) }}
                  </div>
                </div>
                <span
                  v-if="scenario.rank === 1"
                  class="ml-auto px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-semibold"
                >
                  Best
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 text-xs mt-2">
                <div>
                  <div class="text-gray-500">Distance</div>
                  <div class="font-medium text-gray-900">{{ scenario.distance?.toFixed(1) || '0.0' }} km</div>
                </div>
                <div>
                  <div class="text-gray-500">Duration</div>
                  <div class="font-medium text-gray-900">{{ Math.round(scenario.duration || 0) }} min</div>
                </div>
                <div>
                  <div class="text-gray-500">Emissions</div>
                  <div class="font-medium text-gray-900">{{ scenario.emissions?.toFixed(3) || '0.000' }} kg</div>
                </div>
              </div>

              <!-- Emission Bar -->
              <div class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all"
                    :class="getEmissionBarColor(scenario.rank)"
                    :style="{ width: `${scenario.emissionsVsWorst || 0}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  <span v-if="scenario.emissionsVsWorst >= 100">Highest Emissions</span>
                  <span v-else-if="scenario.emissionsVsWorst >= 80">High Emissions</span>
                  <span v-else-if="scenario.emissionsVsWorst >= 50">Moderate Emissions</span>
                  <span v-else>Low Emissions</span>
                  <span v-if="(scenario.savingsVsWorst || 0) > 0">
                    · Saves {{ scenario.savingsVsWorst?.toFixed(3) || '0.000' }} kg CO2
                  </span>
                </div>
              </div>
              
              <!-- Transit Route Actions -->
              <div v-if="scenario.mode === 'transit' && scenario.segments" class="mt-2 space-y-2">
                <button
                  @click.stop="viewRouteDetails(scenario)"
                  class="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📋 View Step-by-Step Directions
                </button>
                
                <!-- Live vehicles availability indicator (only for trackable routes) -->
                <div v-if="hasTrackableVehicles(scenario)" class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800 flex items-center gap-2">
                  <span class="text-base">🚌</span>
                  <span>Live vehicle tracking available</span>
                </div>
              </div>
            </div>

            <div class="text-right ml-2">
              <div class="text-2xl font-bold" :class="getRankColor(scenario.rank)">
                #{{ scenario.rank }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Detailed Steps View -->
    <div v-if="showingDetails && detailedRoute" class="mt-4 overflow-y-auto">
      <!-- Back Button -->
      <button
        @click="backToRoutes"
        class="mb-3 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Routes
      </button>
      
      <!-- Live tracking status indicator (only in detailed view) -->
      <div v-if="hasTrackableVehicles(detailedRoute)" class="mb-3">
        <!-- Loading state -->
        <div v-if="isLoadingVehicles" class="bg-purple-50 border border-purple-200 rounded-lg p-2 text-xs text-purple-800 flex items-center gap-2">
          <div class="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          <span>Loading live vehicles...</span>
        </div>
        
        <!-- Tracking active -->
        <div v-else-if="isTrackingVehicles && !vehicleTrackingError" class="rounded-lg p-2 text-xs flex items-center gap-2"
             :class="vehicleDataFreshness?.isStale ? 'bg-orange-50 border border-orange-200 text-orange-800' : 'bg-green-50 border border-green-200 text-green-800'">
          <span class="text-base">📍</span>
          <div class="flex-1">
            <div class="font-semibold flex items-center gap-2">
              <span>Live tracking active</span>
              <span v-if="vehicleDataFreshness" class="px-1.5 py-0.5 rounded text-xs font-medium"
                    :class="vehicleDataFreshness.isStale ? 'bg-orange-200 text-orange-900' : 'bg-green-200 text-green-900'">
                {{ vehicleDataFreshness.message }}
              </span>
            </div>
            <div :class="vehicleDataFreshness?.isStale ? 'text-orange-700' : 'text-green-700'" class="mt-0.5">
              <span v-if="vehicleDataFreshness?.vehicleCount">{{ vehicleDataFreshness.vehicleCount }} vehicles</span>
              <span v-else>Updates every 2 minutes</span>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="vehicleTrackingError" class="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-800">
          <div class="font-semibold mb-1">⚠️ Vehicle Tracking Issue</div>
          <div>{{ vehicleTrackingError }}</div>
          <button @click.stop="retryVehicleTracking(detailedRoute)" class="mt-2 text-orange-700 underline hover:text-orange-900">
            Try Again
          </button>
        </div>
      </div>
      
      <!-- Route Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">{{ getIcon(detailedRoute.mode) }}</span>
          <div>
            <div class="font-semibold text-lg">{{ detailedRoute.name }}</div>
            <div class="text-xs opacity-90">{{ getTransitSummary(detailedRoute) }}</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-3 text-sm">
          <div>
            <div class="opacity-75">Distance</div>
            <div class="font-bold">{{ detailedRoute.distance?.toFixed(1) }} km</div>
          </div>
          <div>
            <div class="opacity-75">Duration</div>
            <div class="font-bold">{{ Math.round(detailedRoute.duration) }} min</div>
          </div>
          <div>
            <div class="opacity-75">Emissions</div>
            <div class="font-bold">{{ detailedRoute.emissions?.toFixed(3) }} kg</div>
          </div>
        </div>
      </div>
      
      <!-- Step-by-Step Directions -->
      <div class="space-y-3">
        <div
          v-for="(step, index) in detailedRoute.segments"
          :key="index"
          class="bg-white border rounded-lg p-3"
        >
          <div class="flex items-start gap-3">
            <!-- Step Number -->
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 :class="step.type === 'transit' ? 'bg-blue-100 text-blue-700' : step.type === 'transfer' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'">
              {{ index + 1 }}
            </div>
            
            <!-- Step Content -->
            <div class="flex-1">
              <!-- Instruction -->
              <div class="font-medium text-sm text-gray-900 mb-1">
                {{ step.instruction }}
              </div>
              
              <!-- Transit Details -->
              <div v-if="step.type === 'transit'" class="space-y-1 text-xs">
                <div class="flex items-center gap-2 text-gray-600">
                  <span>🚏 Board:</span>
                  <span class="font-medium">{{ step.boardStop?.name }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <span>🚏 Alight:</span>
                  <span class="font-medium">{{ step.alightStop?.name }}</span>
                </div>
                <div class="text-gray-500 mt-1">
                  {{ step.distance?.toFixed(1) }} km · {{ Math.round(step.duration) }} min
                </div>
              </div>
              
              <!-- Walk Details -->
              <div v-else-if="step.type === 'walk'" class="text-xs text-gray-600">
                <div>{{ step.distance?.toFixed(2) }} km · {{ Math.round(step.duration) }} min</div>
              </div>
              
              <!-- Transfer Details -->
              <div v-else-if="step.type === 'transfer'" class="text-xs text-gray-600">
                <div class="flex items-center gap-1">
                  <span>⏱️ Wait time:</span>
                  <span class="font-medium">{{ Math.round(step.duration) }} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-3"></div>
        <p class="text-gray-600 text-sm">Calculating emissions...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-lg p-4 border-2" :class="error.includes('coming soon') || error.includes('Coming Soon') ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-200'">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 text-2xl">
          {{ error.includes('coming soon') || error.includes('Coming Soon') ? '🚀' : '❌' }}
        </div>
        <div class="flex-1">
          <div class="font-semibold text-sm mb-1" :class="error.includes('coming soon') || error.includes('Coming Soon') ? 'text-blue-900' : 'text-red-900'">
            {{ error.includes('coming soon') || error.includes('Coming Soon') ? 'Feature Coming Soon' : 'Error' }}
          </div>
          <div class="text-sm whitespace-pre-line" :class="error.includes('coming soon') || error.includes('Coming Soon') ? 'text-blue-800' : 'text-red-800'">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Initial State -->
    <div v-if="!results && !isLoading && !error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-500 text-sm">
        <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <p>Set origin and destination</p>
        <p class="text-xs mt-1">Click on map to select locations</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { compareRoutes, getRealtimeVehicles } from '@/services/routingApi'

// Props
const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  },
  vehicleDataFreshness: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['location-select-start', 'location-selected', 'route-selected', 'vehicle-tracking-toggle'])

// Refs for inputs
const originInput = ref(null)
const destinationInput = ref(null)

// Data
const origin = ref({ latitude: null, longitude: null, name: '' })
const destination = ref({ latitude: null, longitude: null, name: '' })

// Default Kuala Lumpur coordinates
const DEFAULT_KL_LAT = 3.1390
const DEFAULT_KL_LNG = 101.6869
const results = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isGettingLocation = ref(false)
const selectedRouteId = ref(null)
const selectingFor = ref(null) // 'origin' or 'destination'
const currentSortOption = ref('emissions') // default: lowest emissions
const showingDetails = ref(false) // Track if showing detailed steps
const detailedRoute = ref(null) // Store the route being viewed in detail
const isTrackingVehicles = ref(false) // Track if vehicle tracking is active
const isLoadingVehicles = ref(false) // Track if loading vehicles
const vehicleTrackingError = ref(null) // Store vehicle tracking errors
const transitRoutes = ref([]) // Cache for transit route data

// Sort options
const sortOptions = [
  { value: 'emissions', label: 'Lowest Emissions', icon: '🌱' },
  { value: 'duration', label: 'Fastest', icon: '⏱️' },
  { value: 'distance', label: 'Shortest', icon: '📏' },
  { value: 'convenience', label: 'Most Convenient', icon: '⭐' },
  { value: 'balanced', label: 'Best Balance', icon: '⚖️' }
]

// Google Places Autocomplete instances
let originAutocomplete = null
let destinationAutocomplete = null
let autocompleteInitialized = false

// Computed
const canCompare = computed(() => {
  return origin.value.latitude && origin.value.longitude &&
         destination.value.latitude && destination.value.longitude
})

const canUseGPS = computed(() => {
  // Always show GPS button - if no user location, it will use default Kuala Lumpur
  return true
})

// Sorted scenarios based on current sort option
const sortedScenarios = computed(() => {
  if (!results.value || !results.value.scenarios) return []
  
  const scenarios = [...results.value.scenarios]
  
  scenarios.sort((a, b) => {
    switch (currentSortOption.value) {
      case 'duration':
        return a.duration - b.duration
      case 'emissions':
        return a.emissions - b.emissions
      case 'distance':
        return a.distance - b.distance
      case 'convenience':
        return getConvenienceScore(b) - getConvenienceScore(a) // Higher is better
      case 'balanced':
        return getBalancedScore(a) - getBalancedScore(b) // Lower is better
      default:
        return 0
    }
  })
  
  return scenarios
})

// Methods
const initAutocomplete = () => {
  // Prevent re-initialization
  if (autocompleteInitialized) {
    return
  }

  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.warn('Google Places API not loaded yet')
    return
  }

  // Define KL/Selangor bounds for autocomplete bias
  const klSelangorBounds = new window.google.maps.LatLngBounds(
    new window.google.maps.LatLng(2.5, 101.0),  // Southwest corner
    new window.google.maps.LatLng(3.5, 102.0)   // Northeast corner
  )

  // Initialize origin autocomplete
  if (originInput.value && !originAutocomplete) {
    originAutocomplete = new window.google.maps.places.Autocomplete(originInput.value, {
      componentRestrictions: { country: 'my' }, // Restrict to Malaysia
      fields: ['formatted_address', 'geometry', 'name'],
      bounds: klSelangorBounds, // Bias results to KL/Selangor
      strictBounds: false // Allow results outside bounds but bias to KL/Selangor
    })

    originAutocomplete.addListener('place_changed', () => {
      const place = originAutocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        setLocation(
          'origin',
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          place.formatted_address || place.name
        )
      }
    })
  }

  // Initialize destination autocomplete
  if (destinationInput.value && !destinationAutocomplete) {
    destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInput.value, {
      componentRestrictions: { country: 'my' }, // Restrict to Malaysia
      fields: ['formatted_address', 'geometry', 'name'],
      bounds: klSelangorBounds, // Bias results to KL/Selangor
      strictBounds: false // Allow results outside bounds but bias to KL/Selangor
    })

    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        setLocation(
          'destination',
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          place.formatted_address || place.name
        )
      }
    })
  }

  // Mark as initialized if both are created
  if (originAutocomplete && destinationAutocomplete) {
    autocompleteInitialized = true
    console.log('Autocomplete initialized successfully')
  }
}

const onOriginFocus = () => {
  selectingFor.value = 'origin'
  emit('location-select-start', 'origin')
}

const onDestinationFocus = () => {
  selectingFor.value = 'destination'
  emit('location-select-start', 'destination')
}

const setLocation = (type, lat, lng, name = '') => {
  console.log(`📍 setLocation called: type=${type}, lat=${lat}, lng=${lng}, name=${name}`)
  
  if (type === 'origin') {
    origin.value = {
      latitude: lat,
      longitude: lng,
      name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
    console.log('✅ Origin updated:', origin.value)
  } else {
    destination.value = {
      latitude: lat,
      longitude: lng,
      name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
    console.log('✅ Destination updated:', destination.value)
  }
  
  // Clear old results and route from map when location changes
  if (results.value) {
    console.log('🗺️ Clearing old route - location changed')
    results.value = null
    selectedRouteId.value = null
    showingDetails.value = false
    detailedRoute.value = null
    error.value = null
    transitRoutes.value = [] // Clear transit routes cache
    
    // Stop vehicle tracking if active
    if (isTrackingVehicles.value) {
      console.log('🛑 Stopping vehicle tracking - location changed')
      stopVehicleTracking()
    }
    
    // Emit to clear route but keep origin/destination markers visible
    emit('route-selected', {
      scenario: null,
      origin: origin.value,  // Keep showing origin marker
      destination: destination.value,  // Keep showing destination marker
      realtimeVehicles: null
    })
  }
  
  selectingFor.value = null
  emit('location-selected', { type, lat, lng })
}

const useCurrentLocation = (type) => {
  if (!props.userLocation) {
    // If no user location available, use default Kuala Lumpur
    console.log('📍 No user location available, using default Kuala Lumpur')
    setLocation(type, DEFAULT_KL_LAT, DEFAULT_KL_LNG, 'Kuala Lumpur')
    return
  }
  
  isGettingLocation.value = true
  setTimeout(() => {
    setLocation(type, props.userLocation.lat, props.userLocation.lng, 'Current Location')
    isGettingLocation.value = false
  }, 300)
}

// Clear origin location
const clearOrigin = () => {
  origin.value = { latitude: null, longitude: null, name: '' }
  
  // Clear results when clearing origin
  if (results.value) {
    results.value = null
    selectedRouteId.value = null
    showingDetails.value = false
    detailedRoute.value = null
    error.value = null
    
    // Stop vehicle tracking if active
    if (isTrackingVehicles.value) {
      stopVehicleTracking()
    }
    
    // Emit to clear route from map
    emit('route-selected', {
      scenario: null,
      origin: null,
      destination: destination.value,
      realtimeVehicles: null
    })
  }
}

// Clear destination location
const clearDestination = () => {
  destination.value = { latitude: null, longitude: null, name: '' }
  
  // Clear results when clearing destination
  if (results.value) {
    results.value = null
    selectedRouteId.value = null
    showingDetails.value = false
    detailedRoute.value = null
    error.value = null
    
    // Stop vehicle tracking if active
    if (isTrackingVehicles.value) {
      stopVehicleTracking()
    }
    
    // Emit to clear route from map
    emit('route-selected', {
      scenario: null,
      origin: origin.value,
      destination: null,
      realtimeVehicles: null
    })
  }
}

// Swap origin and destination
const swapLocations = () => {
  // Don't swap if both locations are empty
  if (!origin.value.latitude && !destination.value.latitude) {
    return
  }
  
  console.log('🔄 Swapping origin and destination')
  
  // Store origin values temporarily
  const tempOrigin = { ...origin.value }
  
  // Swap the values
  origin.value = { ...destination.value }
  destination.value = { ...tempOrigin }
  
  // Clear results and route from map when swapping
  if (results.value) {
    console.log('🗺️ Clearing old route after swap')
    results.value = null
    selectedRouteId.value = null
    showingDetails.value = false
    detailedRoute.value = null
    error.value = null
    
    // Stop vehicle tracking if active
    if (isTrackingVehicles.value) {
      console.log('🛑 Stopping vehicle tracking after swap')
      stopVehicleTracking()
    }
    
    // Emit to clear route from map
    emit('route-selected', {
      scenario: null,
      origin: origin.value,
      destination: destination.value,
      realtimeVehicles: null
    })
  }
  
  // Emit location changes to update map markers
  if (origin.value.latitude) {
    emit('location-selected', { 
      type: 'origin', 
      lat: origin.value.latitude, 
      lng: origin.value.longitude 
    })
  }
  if (destination.value.latitude) {
    emit('location-selected', { 
      type: 'destination', 
      lat: destination.value.latitude, 
      lng: destination.value.longitude 
    })
  }
  
  console.log('✅ Locations swapped')
}

// Validate if location is within KL/Selangor region
const isWithinKLSelangor = (location) => {
  // Bounding box for KL and Selangor
  const bounds = {
    north: 3.5,
    south: 2.5,
    east: 102.0,
    west: 101.0
  }
  
  return location.latitude >= bounds.south && 
         location.latitude <= bounds.north &&
         location.longitude >= bounds.west && 
         location.longitude <= bounds.east
}

const handleCompare = async () => {
  console.log('🚀 handleCompare called')
  console.log('📍 Origin:', origin.value)
  console.log('📍 Destination:', destination.value)
  console.log('✅ Can compare:', canCompare.value)
  
  if (!canCompare.value) {
    console.log('❌ Cannot compare - missing origin or destination')
    return
  }

  // Validate origin is within KL/Selangor
  if (!isWithinKLSelangor(origin.value)) {
    console.log('❌ Origin not within KL/Selangor')
    error.value = '📍 Origin must be within Kuala Lumpur or Selangor region.\n\n🚀 Routing for other regions coming soon!'
    return
  }

  // Validate destination is within KL/Selangor
  if (!isWithinKLSelangor(destination.value)) {
    console.log('❌ Destination not within KL/Selangor')
    error.value = '📍 Destination must be within Kuala Lumpur or Selangor region.\n\n🚀 Routing for other regions coming soon!'
    return
  }

  // Stop any existing vehicle tracking before new search
  if (isTrackingVehicles.value) {
    stopVehicleTracking()
  }
  
  // Hide detailed view if showing
  if (showingDetails.value) {
    console.log('📋 Hiding detailed route view')
    showingDetails.value = false
    detailedRoute.value = null
  }

  isLoading.value = true
  error.value = null
  results.value = null
  selectedRouteId.value = null
  transitRoutes.value = [] // Clear transit routes cache
  showingDetails.value = false
  detailedRoute.value = null
  
  // Clear old route from map but keep markers visible
  console.log('🗺️ Clearing old route from map before new comparison')
  emit('route-selected', {
    scenario: null,
    origin: origin.value,  // Keep origin marker visible during calculation
    destination: destination.value,  // Keep destination marker visible during calculation
    realtimeVehicles: null
  })

  try {
    // Always use full comparison to show all routes
    console.log('🔍 Sending route comparison request with:')
    console.log('  Origin:', origin.value)
    console.log('  Destination:', destination.value)
    
    // Validate coordinates before sending
    if (!origin.value.latitude || !origin.value.longitude) {
      error.value = 'Origin coordinates are missing. Please select an origin location.'
      return
    }
    if (!destination.value.latitude || !destination.value.longitude) {
      error.value = 'Destination coordinates are missing. Please select a destination location.'
      return
    }
    
    const response = await compareRoutes(origin.value, destination.value)

    console.log('API Response:', response)

    if (response.success) {
      results.value = response.data
      console.log('Results data:', results.value)
      console.log('Number of scenarios:', results.value.scenarios?.length)
      
      // Count private vs public routes
      const privateCount = results.value.scenarios?.filter(s => s.category === 'private' || s.category === 'active')?.length || 0
      const publicCount = results.value.scenarios?.filter(s => s.category === 'public')?.length || 0
      console.log(`Routes breakdown: ${privateCount} private/active, ${publicCount} public transit`)
      
      if (results.value.scenarios && results.value.scenarios.length > 0) {
        console.log('First scenario FULL DATA:', JSON.stringify(results.value.scenarios[0], null, 2))
        console.log('First scenario keys:', Object.keys(results.value.scenarios[0]))
        
        // Check what route data fields are available
        const firstScenario = results.value.scenarios[0]
        console.log('Route data fields available:', {
          hasPolyline: !!firstScenario.polyline,
          hasGeometry: !!firstScenario.geometry,
          hasPath: !!firstScenario.path,
          hasSteps: !!firstScenario.steps,
          hasDirections: !!firstScenario.directions,
          hasRouteGeometry: !!firstScenario.routeGeometry,
          mode: firstScenario.mode,
          category: firstScenario.category
        })
        
        // Auto-select the best route
        selectRoute(results.value.scenarios[0])
        
        // Log transit route status
        if (publicCount === 0) {
          console.log('ℹ️ No transit routes available for this route')
        } else {
          console.log(`✅ Loaded ${publicCount} transit routes`)
        }
      }
    } else {
      error.value = response.message || 'Failed to compare routes. Please try again.'
    }
  } catch (err) {
    console.error('Route comparison error:', err)
    error.value = err.response?.data?.message || err.message || 'An error occurred while comparing routes'
  } finally {
    isLoading.value = false
  }
}

const selectRoute = async (scenario) => {
  console.log('🔄 Selecting route:', scenario.name)
  
  // Stop any existing vehicle tracking when switching routes
  if (isTrackingVehicles.value) {
    console.log('🛑 Stopping existing tracking before route switch')
    stopVehicleTracking()
    // Wait a bit to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  selectedRouteId.value = scenario.id
  
  // Emit route selection to update map
  emit('route-selected', {
    scenario,
    origin: origin.value,
    destination: destination.value,
    realtimeVehicles: null
  })
}

// Check if route has trackable vehicles (buses or KTMB trains only)
const hasTrackableVehicles = (scenario) => {
  if (scenario.mode !== 'transit' || !scenario.segments) return false
  
  return scenario.segments.some(seg => 
    seg.type === 'transit' && (
      seg.category?.includes('bus') || 
      seg.category?.includes('ktmb')
    )
  )
}

// Start vehicle tracking
const startVehicleTracking = async (scenario) => {
  isLoadingVehicles.value = true
  vehicleTrackingError.value = null
  
  // Fetch initial vehicle data
  try {
    const transitSegments = scenario.segments.filter(s => s.type === 'transit')
      const routes = transitSegments.map(seg => ({
        category: seg.category,
        routeId: seg.routeId,
        options: {
          minutesOld: -1  // Initial fetch: Get most recent data available (regardless of age)
          // directionId: seg.directionId || 0  // Temporarily removed - backend fix pending deployment
        }
      }))
    
    console.log('🚌 Starting vehicle tracking for:', routes)
    const vehicleData = await getRealtimeVehicles(routes)
    
    if (vehicleData.success) {
      isTrackingVehicles.value = true
      vehicleTrackingError.value = null
      
      emit('vehicle-tracking-toggle', {
        action: 'start',
        scenario,
        routes,
        vehicleData: vehicleData // Pass the entire response, not vehicleData.data
      })
      
      console.log(`✅ Tracking ${vehicleData.totalCount || 0} live vehicles`)
      
      // Show friendly message if no vehicles found
      if (!vehicleData.totalCount || vehicleData.totalCount === 0) {
        vehicleTrackingError.value = 'No vehicles currently active on this route. They may appear soon!'
      }
    } else {
      throw new Error(vehicleData.message || 'Failed to fetch vehicle data')
    }
  } catch (error) {
    console.error('❌ Error starting vehicle tracking:', error)
    isTrackingVehicles.value = false
    
    // User-friendly error message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      vehicleTrackingError.value = 'Loading took too long. The server might be waking up - please try again in a moment.'
    } else if (error.message?.includes('Network Error')) {
      vehicleTrackingError.value = 'Network connection issue. Please check your internet and try again.'
    } else {
      vehicleTrackingError.value = 'Unable to load vehicle data at the moment. Please try again.'
    }
  } finally {
    isLoadingVehicles.value = false
  }
}

// Stop vehicle tracking
const stopVehicleTracking = () => {
  console.log('🛑 Stopping vehicle tracking - current state:', isTrackingVehicles.value)
  
  // Emit stop event first
  emit('vehicle-tracking-toggle', {
    action: 'stop',
    scenario: null
  })
  
  // Then clear local state
  isTrackingVehicles.value = false
  isLoadingVehicles.value = false
  vehicleTrackingError.value = null
  
  console.log('✅ Vehicle tracking stopped')
}

// Retry vehicle tracking
const retryVehicleTracking = (scenario) => {
  vehicleTrackingError.value = null
  startVehicleTracking(scenario)
}

// Sorting functions
const setSortOption = (option) => {
  currentSortOption.value = option
  console.log(`📊 Sorting by: ${option}`)
}

// Detailed view functions
const viewRouteDetails = async (scenario) => {
  detailedRoute.value = scenario
  showingDetails.value = true
  console.log('📋 Viewing details for:', scenario.name)
  
  // Update the map to show the selected route
  console.log('🗺️ Updating map to show route:', scenario.name)
  emit('route-selected', {
    scenario,
    origin: origin.value,
    destination: destination.value,
    realtimeVehicles: null
  })
  
  // Start vehicle tracking when viewing details for transit routes
  if (scenario.mode === 'transit' && hasTrackableVehicles(scenario)) {
    console.log('🚌 Starting vehicle tracking for detailed view')
    await startVehicleTracking(scenario)
  }
}

const backToRoutes = () => {
  console.log('⬅️ Back to routes list')
  
  // Stop tracking BEFORE hiding the detailed view
  if (isTrackingVehicles.value) {
    console.log('🛑 Stopping vehicle tracking on back navigation')
    stopVehicleTracking()
  }
  
  // Small delay to ensure stop event is processed
  setTimeout(() => {
    showingDetails.value = false
    detailedRoute.value = null
  }, 100)
}

const getConvenienceScore = (scenario) => {
  let score = 0
  
  // Base score for direct routes (no transfers)
  const transferCount = scenario.segments?.filter(s => s.type === 'walk' && s.fromStop && s.toStop).length || 0
  score += (transferCount === 0) ? 100 : 0
  
  // Penalty for each transfer
  score -= transferCount * 20
  
  // Bonus for active transport (walking/biking - good for short distances)
  if (scenario.mode === 'walking' || scenario.mode === 'bicycle') {
    score += 50
  }
  
  // Small penalty for longer durations
  score -= (scenario.duration || 0) * 0.5
  
  return Math.max(0, score)
}

const getBalancedScore = (scenario) => {
  // Normalize values to 0-1 scale
  const maxEmissions = results.value?.scenarios ? Math.max(...results.value.scenarios.map(s => s.emissions)) : 1
  const maxDuration = results.value?.scenarios ? Math.max(...results.value.scenarios.map(s => s.duration)) : 1
  const maxDistance = results.value?.scenarios ? Math.max(...results.value.scenarios.map(s => s.distance)) : 1
  
  const normEmissions = maxEmissions > 0 ? scenario.emissions / maxEmissions : 0
  const normDuration = maxDuration > 0 ? scenario.duration / maxDuration : 0
  const normDistance = maxDistance > 0 ? scenario.distance / maxDistance : 0
  const normConvenience = 100 - getConvenienceScore(scenario) / 100 // Invert: lower is better
  
  // Weighted formula
  const score = (
    normEmissions * 0.40 +    // 40% weight on emissions
    normDuration * 0.35 +      // 35% weight on duration
    normDistance * 0.15 +      // 15% weight on distance
    normConvenience * 0.10     // 10% weight on convenience
  )
  
  return score
}

const getTransitDetails = (scenario) => {
  if (scenario.mode !== 'transit' || !scenario.segments) {
    return null
  }
  
  const transitSegments = scenario.segments.filter(s => s.type === 'transit')
  if (transitSegments.length === 0) return null
  
  const details = transitSegments.map(seg => {
    const isBus = seg.category?.includes('bus')
    const isRail = seg.category?.includes('rail') || seg.category?.includes('ktmb')
    const type = isBus ? 'Bus' : isRail ? 'Rail' : 'Transit'
    const routeName = seg.routeName || seg.routeId || ''
    const routeLongName = seg.routeLongName || ''
    
    return {
      type,
      routeName,
      routeLongName,
      category: seg.category
    }
  })
  
  return details
}

const getTransitSummary = (scenario) => {
  const details = getTransitDetails(scenario)
  if (!details || details.length === 0) return ''
  
  const types = [...new Set(details.map(d => d.type))]
  const routes = details.map(d => d.routeName).filter(Boolean)
  
  if (routes.length > 0) {
    return `${types.join(' + ')} (${routes.join(' → ')})`
  }
  return types.join(' + ')
}

const getIcon = (mode) => {
  const icons = {
    car: '🚗',
    motorcycle: '🏍️',
    bus: '🚌',
    mrt: '🚇',
    lrt: '🚊',
    train: '🚆',
    monorail: '🚝',
    bicycle: '🚴',
    walking: '🚶',
    transit: '🚇' // Generic transit icon
  }
  return icons[mode] || '🚗'
}

const getRankColor = (rank) => {
  if (rank === 1) return 'text-green-600'
  if (rank <= 3) return 'text-blue-600'
  if (rank <= 5) return 'text-yellow-600'
  return 'text-gray-600'
}

const getEmissionBarColor = (rank) => {
  if (rank === 1) return 'bg-green-500'
  if (rank <= 3) return 'bg-blue-500'
  if (rank <= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Watch for detailed view changes to ensure tracking stops
watch(() => showingDetails.value, (newValue, oldValue) => {
  // When hiding detailed view, ensure tracking stops
  if (oldValue === true && newValue === false) {
    console.log('📴 Detailed view hidden, ensuring tracking stopped')
    if (isTrackingVehicles.value) {
      stopVehicleTracking()
    }
  }
})

// Initialize default location when user location is not available
const initializeDefaultLocation = () => {
  // If no user location is provided, set default Kuala Lumpur as origin
  if (!props.userLocation && !origin.value.latitude) {
    console.log('📍 Setting default Kuala Lumpur location as origin')
    origin.value = {
      latitude: DEFAULT_KL_LAT,
      longitude: DEFAULT_KL_LNG,
      name: 'Kuala Lumpur'
    }
    
    console.log('✅ Default origin set:', origin.value)
    
    // Emit the default location to update map markers
    emit('location-selected', { 
      type: 'origin', 
      lat: DEFAULT_KL_LAT, 
      lng: DEFAULT_KL_LNG 
    })
  } else {
    console.log('📍 User location available or origin already set:', {
      hasUserLocation: !!props.userLocation,
      hasOrigin: !!origin.value.latitude,
      origin: origin.value
    })
  }
}

// Watch for user location changes to set default if needed
watch(() => props.userLocation, (newUserLocation) => {
  // If user location becomes available, update origin
  if (newUserLocation && newUserLocation.lat && newUserLocation.lng) {
    console.log('📍 User location updated, setting as origin')
    setLocation('origin', newUserLocation.lat, newUserLocation.lng, 'Current Location')
  } else if (!newUserLocation && !origin.value.latitude) {
    // If no user location and no origin set, use default Kuala Lumpur
    console.log('📍 No user location, setting default Kuala Lumpur as origin')
    initializeDefaultLocation()
  }
}, { immediate: true })

// Lifecycle hooks
onMounted(() => {
  // Initialize default location first
  initializeDefaultLocation()
  
  // Initialize autocomplete after a short delay to ensure DOM is ready
  setTimeout(() => {
    initAutocomplete()
  }, 500)
  
  // Retry if Google API not loaded yet
  const checkInterval = setInterval(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete()
      clearInterval(checkInterval)
    }
  }, 1000)
  
  // Stop checking after 10 seconds
  setTimeout(() => clearInterval(checkInterval), 10000)
})

onUnmounted(() => {
  console.log('🔄 RouteComparison unmounting - cleaning up')
  
  // Stop vehicle tracking when component unmounts
  if (isTrackingVehicles.value) {
    console.log('🛑 Stopping tracking on unmount')
    stopVehicleTracking()
  }
  
  // Cleanup autocomplete listeners
  if (originAutocomplete) {
    window.google.maps.event.clearInstanceListeners(originAutocomplete)
  }
  if (destinationAutocomplete) {
    window.google.maps.event.clearInstanceListeners(destinationAutocomplete)
  }
})

// Expose methods for parent component
defineExpose({
  setLocation,
  selectingFor,
  handleCompare
})
</script>

<style scoped>
.route-card {
  transition: all 0.2s ease-in-out;
}

.route-card:hover {
  transform: translateY(-1px);
}

.location-section input {
  outline: none;
}

.location-section input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Custom scrollbar styling */
.route-comparison :deep(*::-webkit-scrollbar) {
  width: 6px;
}

.route-comparison :deep(*::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}

.route-comparison :deep(*::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

.route-comparison :deep(*::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}
</style>

<style>
/* Global styles for Google Places Autocomplete dropdown */
.pac-container {
  z-index: 10000 !important;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  margin-top: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.pac-item {
  padding: 8px 12px;
  cursor: pointer;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
  line-height: 1.5;
}

.pac-item:first-child {
  border-top: none;
}

.pac-item:hover {
  background-color: #f9fafb;
}

.pac-item-selected {
  background-color: #f0fdf4;
}

.pac-icon {
  background-image: none !important;
  margin-right: 8px;
}

.pac-icon::before {
  content: ">";
  font-size: 14px;
  color: #666;
}

.pac-item-query {
  color: #111827;
  font-weight: 500;
}

.pac-matched {
  font-weight: 600;
  color: #059669;
}
</style>

