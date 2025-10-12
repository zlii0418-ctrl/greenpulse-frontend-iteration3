<template>
  <div class="route-comparison flex flex-col" style="scroll-behavior: smooth;">
    <!-- Location Inputs -->
    <div class="space-y-4 mb-4">
      <!-- Origin Section -->
      <div class="location-section">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-700">Origin</h3>
          <button
            v-if="canUseGPS"
            @click="useCurrentLocation('origin')"
            :disabled="isGettingLocation"
            class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {{ isGettingLocation ? 'Getting...' : 'Use GPS' }}
          </button>
        </div>
        <input
          ref="originInput"
          v-model="origin.name"
          type="text"
          placeholder="Enter address or click on map"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          @focus="onOriginFocus"
        />
      </div>

      <!-- Destination Section -->
      <div class="location-section">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-700">Destination</h3>
        </div>
        <input
          ref="destinationInput"
          v-model="destination.name"
          type="text"
          placeholder="Enter address or click on map"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
          @focus="onDestinationFocus"
        />
      </div>

      <!-- Compare Button -->
      <button
        @click="handleCompare"
        :disabled="!canCompare || isLoading"
        class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {{ isLoading ? 'Finding Routes...' : 'Find All Routes' }}
      </button>
    </div>

    <!-- Results Section -->
    <div v-if="results" class="mt-4">
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
                  {{ scenario.emissionsVsWorst || 0 }}% of worst
                  <span v-if="(scenario.savingsVsWorst || 0) > 0">
                    · Saves {{ scenario.savingsVsWorst?.toFixed(3) || '0.000' }} kg CO2
                  </span>
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-3"></div>
        <p class="text-gray-600 text-sm">Calculating emissions...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <div class="text-red-800 text-sm font-medium">{{ error }}</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { compareRoutes } from '@/services/routingApi'

// Props
const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['location-select-start', 'location-selected', 'route-selected'])

// Refs for inputs
const originInput = ref(null)
const destinationInput = ref(null)

// Data
const origin = ref({ latitude: null, longitude: null, name: '' })
const destination = ref({ latitude: null, longitude: null, name: '' })
const results = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isGettingLocation = ref(false)
const selectedRouteId = ref(null)
const selectingFor = ref(null) // 'origin' or 'destination'
const currentSortOption = ref('duration') // default: fastest

// Sort options
const sortOptions = [
  { value: 'duration', label: 'Fastest', icon: '⏱️' },
  { value: 'emissions', label: 'Lowest Emissions', icon: '🌱' },
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
  return props.userLocation && props.userLocation.lat && props.userLocation.lng
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

  // Initialize origin autocomplete
  if (originInput.value && !originAutocomplete) {
    originAutocomplete = new window.google.maps.places.Autocomplete(originInput.value, {
      componentRestrictions: { country: 'my' }, // Restrict to Malaysia
      fields: ['formatted_address', 'geometry', 'name']
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
      fields: ['formatted_address', 'geometry', 'name']
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
  if (type === 'origin') {
    origin.value = {
      latitude: lat,
      longitude: lng,
      name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  } else {
    destination.value = {
      latitude: lat,
      longitude: lng,
      name: name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }
  selectingFor.value = null
  emit('location-selected', { type, lat, lng })
}

const useCurrentLocation = (type) => {
  if (!props.userLocation) return
  
  isGettingLocation.value = true
  setTimeout(() => {
    setLocation(type, props.userLocation.lat, props.userLocation.lng, 'Current Location')
    isGettingLocation.value = false
  }, 300)
}

const handleCompare = async () => {
  if (!canCompare.value) return

  isLoading.value = true
  error.value = null
  results.value = null
  selectedRouteId.value = null

  try {
    // Always use full comparison to show all routes
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

const selectRoute = (scenario) => {
  selectedRouteId.value = scenario.id
  emit('route-selected', {
    scenario,
    origin: origin.value,
    destination: destination.value
  })
}

// Sorting functions
const setSortOption = (option) => {
  currentSortOption.value = option
  console.log(`📊 Sorting by: ${option}`)
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

// Lifecycle hooks
onMounted(() => {
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
  selectingFor
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

