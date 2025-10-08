<template>
  <div class="google-map-container">
    <div 
      ref="mapContainer" 
      class="w-full h-full"
      :style="{ height: mapHeight }"
    ></div>
    
    <!-- Map loading state -->
    <div 
      v-if="!isMapLoaded" 
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading map...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, shallowRef, markRaw } from 'vue'

// Props
const props = defineProps({
  places: {
    type: Array,
    default: () => []
  },
    center: {
      type: Object,
      default: () => ({ lat: 39.9042, lng: 116.4074 }) // Default Beijing
  },
  zoom: {
    type: Number,
    default: 10
  },
  mapHeight: {
    type: String,
    default: 'calc(100vh - 4rem)'
  },
  userLocation: {
    type: Object,
    default: null
  },
  selectedPlaceId: {
    type: [Number, String],
    default: null
  }
})

// Emits
const emit = defineEmits(['place-click'])

// Reactive data
const mapContainer = ref(null)
const map = shallowRef(null)
const markers = shallowRef([])
const userLocationMarker = ref(null)
const isMapLoaded = ref(false)

// Performance optimization: render throttling
let updateMarkersTimer = null
let isUpdatingMarkers = false

// Performance optimization: marker visibility detection
let visibleMarkers = new Set()
let boundsChangedListener = null

// Performance optimization: pre-cache SVG icons
const iconCache = {
  greenPlace: null,
  highlightedPlace: null,
  userLocation: null
}

// Initialize icon cache
const initIconCache = () => {
  if (window.google && window.google.maps) {
    // Green place icon
    iconCache.greenPlace = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#ffffff"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    }
    
    // Highlighted place icon (red)
    iconCache.highlightedPlace = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="#EF4444" stroke="#ffffff" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="#ffffff"/>
          <circle cx="20" cy="20" r="4" fill="#EF4444"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    }
    
    // User location icon
    iconCache.userLocation = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          <circle cx="16" cy="16" r="3" fill="#3B82F6"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    }
  }
}

// Check if marker is in bounds
const isMarkerInBounds = (marker) => {
  if (!map.value || !marker) return true
  
  const bounds = map.value.getBounds()
  if (!bounds) return true
  
  const position = marker.getPosition()
  return bounds.contains(position)
}

// Update marker visibility
const updateMarkerVisibility = () => {
  if (!map.value) return
  
  markers.value.forEach((marker, index) => {
    const isVisible = isMarkerInBounds(marker)
    const wasVisible = visibleMarkers.has(index)
    
    if (isVisible && !wasVisible) {
      // Marker enters view, show marker
      marker.setMap(map.value)
      visibleMarkers.add(index)
    } else if (!isVisible && wasVisible) {
      // Marker leaves view, hide marker
      marker.setMap(null)
      visibleMarkers.delete(index)
    }
  })
}

// Initialize map
const initMap = async () => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded')
    return
  }

  try {
    // Initialize icon cache
    initIconCache()
    
    // Create map instance
    map.value = markRaw(new window.google.maps.Map(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    }))

    isMapLoaded.value = true
    
    // Add bounds changed listener
    boundsChangedListener = map.value.addListener('bounds_changed', () => {
      throttledUpdateMarkerVisibility()
    })
    
    // Add place markers
    updateMarkers()
    
  } catch (error) {
    console.error('Map initialization failed:', error)
  }
}

// Throttled version of update markers function
const throttledUpdateMarkers = () => {
  if (updateMarkersTimer) {
    clearTimeout(updateMarkersTimer)
  }
  
  updateMarkersTimer = setTimeout(() => {
    if (!isUpdatingMarkers) {
      updateMarkers()
    }
  }, 100) // 100ms throttling
}

// Throttled version of visibility update function
let visibilityTimer = null
const throttledUpdateMarkerVisibility = () => {
  if (visibilityTimer) {
    clearTimeout(visibilityTimer)
  }
  
  visibilityTimer = setTimeout(() => {
    updateMarkerVisibility()
  }, 150) // 150ms throttling
}

// Update markers
const updateMarkers = () => {
  if (!map.value || isUpdatingMarkers) return
  
  isUpdatingMarkers = true
  console.log('Updating markers, places count:', props.places.length)

  // Clear existing markers
  clearMarkers()

  // Add new markers
  props.places.forEach((place, index) => {
    if (place.latitude && place.longitude) {
      const marker = markRaw(new window.google.maps.Marker({
        position: {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        },
        map: map.value, // 直接显示在地图上
        title: place.name,
        icon: place.id === props.selectedPlaceId ? iconCache.highlightedPlace : iconCache.greenPlace
      }))

      // Add click event
      marker.addListener('click', () => {
        emit('place-click', place)
      })

      markers.value.push(marker)
    }
  })

  console.log('Total created', markers.value.length, 'markers')

  // If there are markers and no user location, adjust map bounds to show all markers
  if (markers.value.length > 0 && !props.userLocation) {
    const bounds = new window.google.maps.LatLngBounds()
    markers.value.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
    map.value.fitBounds(bounds)
  }
  
  isUpdatingMarkers = false
}

// Clear all markers
const clearMarkers = () => {
  markers.value.forEach(marker => {
    marker.setMap(null)
  })
  markers.value = []
}

// Create user location marker
const createUserLocationMarker = () => {
  if (!map.value || !props.userLocation) return

  // Clear existing user location marker
  if (userLocationMarker.value) {
    userLocationMarker.value.setMap(null)
  }

  // Create new user location marker
  userLocationMarker.value = markRaw(new window.google.maps.Marker({
    position: {
      lat: props.userLocation.lat,
      lng: props.userLocation.lng
    },
    map: map.value,
    title: 'My Location',
    icon: iconCache.userLocation, // Use cached icon
    animation: window.google.maps.Animation.DROP
  }))
}

// Clear user location marker
const clearUserLocationMarker = () => {
  if (userLocationMarker.value) {
    userLocationMarker.value.setMap(null)
    userLocationMarker.value = null
  }
}

// Watch places changes
watch(() => props.places, () => {
  if (isMapLoaded.value) {
    throttledUpdateMarkers()
  }
}, { deep: true })

// Watch user location changes
watch(() => props.userLocation, (newLocation) => {
  if (isMapLoaded.value) {
    if (newLocation) {
      createUserLocationMarker()
      // Ensure green place markers still display
      throttledUpdateMarkers()
    } else {
      clearUserLocationMarker()
    }
  }
}, { deep: true })

// Watch center changes
watch(() => props.center, (newCenter) => {
  if (map.value && newCenter) {
    map.value.setCenter(newCenter)
  }
})

// Watch zoom changes
watch(() => props.zoom, (newZoom) => {
  if (map.value && newZoom) {
    map.value.setZoom(newZoom)
  }
})

// Watch selectedPlaceId changes to update marker highlighting
watch(() => props.selectedPlaceId, () => {
  if (isMapLoaded.value) {
    throttledUpdateMarkers()
  }
})

// Component mounted
onMounted(async () => {
  // Wait for Google Maps API to load
  if (window.google && window.google.maps) {
    await nextTick()
    initMap()
  } else {
    // If API not yet loaded, wait for loading to complete
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps)
        nextTick().then(() => {
          initMap()
        })
      }
    }, 100)

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkGoogleMaps)
      if (!isMapLoaded.value) {
        console.error('Google Maps API loading timeout')
      }
    }, 10000)
  }
})

// Component unmounted
onUnmounted(() => {
  // Clean up timers
  if (updateMarkersTimer) {
    clearTimeout(updateMarkersTimer)
  }
  if (visibilityTimer) {
    clearTimeout(visibilityTimer)
  }
  
  // Clean up listeners
  if (boundsChangedListener) {
    window.google.maps.event.removeListener(boundsChangedListener)
  }
  
  // Clean up markers
  clearMarkers()
  clearUserLocationMarker()
  
  // Clean up state
  visibleMarkers.clear()
  
  if (map.value) {
    map.value = null
  }
})
</script>

<style scoped>
.google-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>