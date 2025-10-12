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
    default: () => ({ lat: 3.1390, lng: 101.6869 }) // Default Kuala Lumpur
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
  },
  routingData: {
    type: Object,
    default: null
  },
  routingMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['place-click', 'map-click', 'vehicle-data-freshness'])

// Reactive data
const mapContainer = ref(null)
const map = shallowRef(null)
const markers = shallowRef([])
const userLocationMarker = ref(null)
const isMapLoaded = ref(false)

// Routing-specific reactive data
const originMarker = ref(null)
const destinationMarker = ref(null)
const routePolylines = ref([])
const vehicleMarkers = ref([])
let vehicleRefreshInterval = null

// Performance optimization: render throttling
let updateMarkersTimer = null
let isUpdatingMarkers = false

// Performance optimization: marker visibility detection
const visibleMarkers = new Set()
let boundsChangedListener = null

// Performance optimization: pre-cache SVG icons
const iconCache = {
  greenPlace: null,
  highlightedPlace: null,
  userLocation: null,
  routeOrigin: null,
  routeDestination: null
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
    
    // Route origin icon (green pin)
    iconCache.routeOrigin = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C11.2 0 4 7.2 4 16c0 12 16 34 16 34s16-22 16-34c0-8.8-7.2-16-16-16z" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
          <circle cx="20" cy="16" r="6" fill="#ffffff"/>
          <text x="20" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#10B981">A</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 50),
      anchor: new window.google.maps.Point(20, 50)
    }
    
    // Route destination icon (red pin)
    iconCache.routeDestination = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C11.2 0 4 7.2 4 16c0 12 16 34 16 34s16-22 16-34c0-8.8-7.2-16-16-16z" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
          <circle cx="20" cy="16" r="6" fill="#ffffff"/>
          <text x="20" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#EF4444">B</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 50),
      anchor: new window.google.maps.Point(20, 50)
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
  
  // Don't update marker visibility in routing mode
  if (props.routingMode) {
    // Ensure all markers stay hidden
    markers.value.forEach(marker => marker.setMap(null))
    visibleMarkers.clear()
    return
  }
  
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
    
    // Add map click listener for routing mode
    map.value.addListener('click', (event) => {
      if (props.routingMode) {
        emit('map-click', {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        })
      }
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
  
  // SKIP marker updates completely if in routing mode
  if (props.routingMode) {
    console.log('Skipping marker update - in routing mode')
    // Make sure all markers are hidden
    markers.value.forEach(marker => marker.setMap(null))
    return
  }
  
  isUpdatingMarkers = true
  console.log('Updating markers, places count:', props.places.length)
  console.log('Current routing mode:', props.routingMode)

  // Clear existing markers
  clearMarkers()

  // Add new markers
  props.places.forEach((place) => {
    if (place.latitude && place.longitude) {
      const marker = markRaw(new window.google.maps.Marker({
        position: {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        },
        // Hide markers in routing mode, show in search mode
        map: props.routingMode ? null : map.value,
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

  console.log(`Total created ${markers.value.length} markers, visibility: ${props.routingMode ? 'HIDDEN' : 'VISIBLE'}`)

  // If there are markers and no user location, adjust map bounds to show all markers
  // But only in search mode
  if (markers.value.length > 0 && !props.userLocation && !props.routingMode) {
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

// Real-time vehicle tracking state
const trackingRoutes = ref(null)
const trackingActive = ref(false)

// Real-time vehicle functions with improved visuals and caching
const updateVehicleMarkers = (vehicleData) => {
  if (!map.value || !vehicleData || !vehicleData.vehicles) {
    clearVehicleMarkers()
    return
  }

  console.log(`🚌 Updating ${vehicleData.vehicles.length} vehicle markers`)
  
  // Calculate data freshness
  let oldestDataAgeSeconds = 0
  let dataFreshnessMessage = 'Live'
  
  if (vehicleData.vehicles.length > 0) {
    const now = Date.now()
    const ages = vehicleData.vehicles.map(v => {
      const timestamp = new Date(v.created_at || now).getTime()
      return (now - timestamp) / 1000
    })
    oldestDataAgeSeconds = Math.max(...ages)
    
    if (oldestDataAgeSeconds < 60) {
      dataFreshnessMessage = `Live (${Math.floor(oldestDataAgeSeconds)}s old)`
    } else if (oldestDataAgeSeconds < 300) {
      dataFreshnessMessage = `${Math.floor(oldestDataAgeSeconds / 60)} min old`
    } else {
      dataFreshnessMessage = `⚠️ ${Math.floor(oldestDataAgeSeconds / 60)} min old (stale)`
    }
    
    console.log(`📊 Vehicle data freshness: ${dataFreshnessMessage}`)
    
    // Emit freshness data to parent component
    emit('vehicle-data-freshness', {
      ageSeconds: oldestDataAgeSeconds,
      message: dataFreshnessMessage,
      isStale: oldestDataAgeSeconds > 300,
      vehicleCount: vehicleData.vehicles.length
    })
  }
  
  // Clear existing vehicle markers
  clearVehicleMarkers()

  // Create markers for each vehicle with enhanced visuals
  vehicleData.vehicles.forEach(vehicle => {
    const lat = parseFloat(vehicle.latitude)
    const lng = parseFloat(vehicle.longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid vehicle coordinates:', vehicle)
      return
    }

    // Determine vehicle color based on route type
    let vehicleColor = '#4285f4' // Default blue
    let vehicleIcon = '🚌'
    
    if (vehicle.route_id || vehicle.routeId) {
      const routeId = vehicle.route_id || vehicle.routeId
      if (routeId.startsWith('U') || routeId.includes('BUS')) {
        vehicleColor = '#ff6b35' // Orange for buses
        vehicleIcon = '🚌'
      } else if (routeId.includes('KJ') || routeId.includes('PY') || 
                 routeId.includes('AG') || routeId.includes('SP')) {
        vehicleColor = '#e11d48' // Red for MRT/LRT
        vehicleIcon = '🚇'
      } else {
        vehicleColor = '#7c3aed' // Purple for trains
        vehicleIcon = '🚆'
      }
    }

    // Create larger icon with bearing if available
    let icon
    if (vehicle.bearing !== null && vehicle.bearing !== undefined) {
      // Larger arrow icon pointing in direction of travel
      icon = {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 8, // Increased from 6 to 8
        fillColor: vehicleColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3, // Increased from 2 to 3
        rotation: vehicle.bearing
      }
    } else {
      // Larger circle icon if no bearing
      icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12, // Increased from 8 to 12
        fillColor: vehicleColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3 // Increased from 2 to 3
      }
    }

    // Create marker
    const marker = markRaw(new window.google.maps.Marker({
      position: { lat, lng },
      map: map.value,
      title: `${vehicleIcon} Vehicle ${vehicle.vehicle_label || vehicle.vehicleId || vehicle.vehicle_id}`,
      icon: icon,
      zIndex: 1000, // High z-index to appear above routes
      animation: window.google.maps.Animation.DROP
    }))

    // Calculate individual vehicle data age
    const vehicleTimestamp = new Date(vehicle.created_at || Date.now()).getTime()
    const vehicleAgeSeconds = Math.floor((Date.now() - vehicleTimestamp) / 1000)
    let vehicleAgeDisplay = ''
    let vehicleAgeColor = '#22c55e' // Green for fresh
    
    if (vehicleAgeSeconds < 60) {
      vehicleAgeDisplay = `${vehicleAgeSeconds}s ago`
      vehicleAgeColor = '#22c55e' // Green
    } else if (vehicleAgeSeconds < 180) {
      vehicleAgeDisplay = `${Math.floor(vehicleAgeSeconds / 60)} min ago`
      vehicleAgeColor = '#eab308' // Yellow
    } else {
      vehicleAgeDisplay = `${Math.floor(vehicleAgeSeconds / 60)} min ago`
      vehicleAgeColor = '#ef4444' // Red
    }
    
    // Add info window with vehicle details
    const infoContent = `
      <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: ${vehicleColor};">
          ${vehicleIcon} ${vehicle.vehicle_label || vehicle.vehicleId || vehicle.vehicle_id || 'Unknown'}
        </h4>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>Route:</strong> ${vehicle.route_id || vehicle.routeId || 'Unknown'}<br>
          ${vehicle.speed ? `<strong>Speed:</strong> ${vehicle.speed.toFixed(1)} km/h<br>` : ''}
          ${vehicle.current_status ? `<strong>Status:</strong> ${vehicle.current_status}<br>` : ''}
          ${vehicle.direction_id !== null && vehicle.direction_id !== undefined ? `<strong>Direction:</strong> ${vehicle.direction_id}<br>` : ''}
          <strong>Updated:</strong> ${new Date(vehicle.created_at || Date.now()).toLocaleTimeString()}
        </p>
        <div style="margin-top: 8px; padding: 4px 8px; background: ${vehicleAgeColor}22; border-left: 3px solid ${vehicleAgeColor}; border-radius: 4px;">
          <span style="font-size: 11px; color: ${vehicleAgeColor}; font-weight: 600;">
            📊 Data: ${vehicleAgeDisplay}
          </span>
        </div>
      </div>
    `
    
    const infoWindow = markRaw(new window.google.maps.InfoWindow({
      content: infoContent
    }))
    
    marker.addListener('click', () => {
      // Close other info windows
      vehicleMarkers.value.forEach(m => {
        if (m.infoWindow) m.infoWindow.close()
      })
      infoWindow.open(map.value, marker)
    })
    
    marker.infoWindow = infoWindow
    vehicleMarkers.value.push(marker)
  })

  console.log(`✅ Created ${vehicleMarkers.value.length} vehicle markers`)
}

const clearVehicleMarkers = () => {
  vehicleMarkers.value.forEach(marker => {
    if (marker) {
      marker.setMap(null)
    }
  })
  vehicleMarkers.value = []
}

const startVehicleRefresh = async (routes, initialVehicleData = null) => {
  // Clear any existing interval
  stopVehicleRefresh()
  
  if (!routes || routes.length === 0) {
    console.warn('⚠️ No routes provided for vehicle tracking')
    return
  }

  trackingRoutes.value = routes
  trackingActive.value = true

  // Display initial vehicle data if provided
  if (initialVehicleData) {
    updateVehicleMarkers(initialVehicleData)
  }

  // Import here to avoid circular dependencies
  const { getRealtimeVehicles } = await import('@/services/routingApi')
  
  // Function to fetch and update vehicles with caching
  const fetchAndUpdateVehicles = async () => {
    if (!trackingActive.value || !trackingRoutes.value) {
      return
    }

    try {
      // Check session storage cache
      const cacheKey = 'vehicles_' + JSON.stringify(trackingRoutes.value)
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Use cache if less than 2 minutes old
        if (Date.now() - timestamp < 120000) {
          const ageSeconds = Math.round((Date.now() - timestamp) / 1000)
          console.log(`📦 Using cached vehicle data (${ageSeconds}s old)`)
          updateVehicleMarkers(data)
          return
        }
      }

      // Fetch fresh data
      console.log('🔄 Fetching fresh vehicle data...')
      const vehicleData = await getRealtimeVehicles(trackingRoutes.value)
      
      if (vehicleData.success && vehicleData.data) {
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: vehicleData.data,
          timestamp: Date.now()
        }))
        
        updateVehicleMarkers(vehicleData.data)
        console.log(`✅ Updated ${vehicleData.data.vehicles?.length || 0} vehicle positions`)
      }
    } catch (error) {
      console.warn('⚠️ Error refreshing vehicles:', error.message)
    }
  }

  // Initial fetch if no initial data provided
  if (!initialVehicleData) {
    await fetchAndUpdateVehicles()
  }
  
  // Set up interval to refresh every 2 minutes
  vehicleRefreshInterval = setInterval(fetchAndUpdateVehicles, 120000)

  console.log('🔄 Started vehicle refresh (every 2 minutes)')
}

const stopVehicleRefresh = () => {
  if (vehicleRefreshInterval) {
    clearInterval(vehicleRefreshInterval)
    vehicleRefreshInterval = null
  }
  
  trackingActive.value = false
  trackingRoutes.value = null
  clearVehicleMarkers()
  
  console.log('⏹️ Stopped vehicle refresh and cleared markers')
}

// Expose methods for parent component to control vehicle tracking
defineExpose({
  startVehicleTracking: startVehicleRefresh,
  stopVehicleTracking: stopVehicleRefresh
})

// Routing functions
const updateRoutingMarkers = () => {
  if (!map.value || !props.routingData) {
    clearRoutingMarkers()
    return
  }

  const { origin, destination } = props.routingData

  // Create or update origin marker (with higher z-index to appear on top)
  if (origin && origin.latitude && origin.longitude) {
    if (originMarker.value) {
      originMarker.value.setPosition({ lat: origin.latitude, lng: origin.longitude })
      originMarker.value.setMap(map.value)
    } else {
      originMarker.value = markRaw(new window.google.maps.Marker({
        position: { lat: origin.latitude, lng: origin.longitude },
        map: map.value,
        title: 'Origin - Point A',
        icon: iconCache.routeOrigin,
        animation: window.google.maps.Animation.DROP,
        zIndex: 1000 // High z-index to appear above other markers
      }))
    }
  }

  // Create or update destination marker (with higher z-index to appear on top)
  if (destination && destination.latitude && destination.longitude) {
    if (destinationMarker.value) {
      destinationMarker.value.setPosition({ lat: destination.latitude, lng: destination.longitude })
      destinationMarker.value.setMap(map.value)
    } else {
      destinationMarker.value = markRaw(new window.google.maps.Marker({
        position: { lat: destination.latitude, lng: destination.longitude },
        map: map.value,
        title: 'Destination - Point B',
        icon: iconCache.routeDestination,
        animation: window.google.maps.Animation.DROP,
        zIndex: 1001 // Slightly higher to appear above origin
      }))
    }
  }

  // Draw route from routing data
  if (props.routingData && props.routingData.selectedRoute) {
    drawRoute(props.routingData.selectedRoute)
  } else if (origin && destination) {
    // Fallback: draw straight line if no route data
    drawRoute(null)
  }
  
  console.log('Routing markers updated:', { 
    hasOrigin: !!originMarker.value, 
    hasDest: !!destinationMarker.value,
    hasRoutes: routePolylines.value.length
  })
}

const drawRoute = (routeData) => {
  // Clear existing routes
  clearRoutePolylines()

  const origin = props.routingData?.origin
  const destination = props.routingData?.destination

  if (!origin || !destination) {
    console.warn('Missing origin or destination')
    return
  }

  if (!routeData) {
    console.log('No route data, drawing straight line')
    drawStraightLine(origin, destination)
    return
  }

  const color = getRouteColor(routeData.mode)
  
  // Handle transit routes with segments
  if (routeData.segments && Array.isArray(routeData.segments)) {
    console.log('Drawing transit route with', routeData.segments.length, 'segments')
    console.log('Full route data:', routeData)
    let totalPoints = 0
    
    routeData.segments.forEach((segment, index) => {
      console.log(`Segment ${index}:`, segment.type, segment)
      if (segment.type === 'transit') {
        if (segment.geometry) {
          console.log(`  Transit segment geometry type:`, typeof segment.geometry, 'length:', segment.geometry?.length)
          // Draw transit segment with actual route geometry
          let path = segment.geometry
          
          // If it's an encoded string, decode it
          if (typeof path === 'string') {
            path = decodePolyline(path)
          }
          
          if (Array.isArray(path) && path.length > 0) {
            console.log(`  Decoded ${path.length} points for ${segment.routeName || 'transit'}`)
            console.log(`    Start: [${path[0].lat.toFixed(5)}, ${path[0].lng.toFixed(5)}]`)
            console.log(`    End: [${path[path.length-1].lat.toFixed(5)}, ${path[path.length-1].lng.toFixed(5)}]`)
            console.log(`    Should connect to boardStop: [${segment.boardStop?.latitude}, ${segment.boardStop?.longitude}]`)
            console.log(`    Should connect to alightStop: [${segment.alightStop?.latitude}, ${segment.alightStop?.longitude}]`)
            
            const segmentColor = getRouteColor(segment.mode)
            const polyline = markRaw(new window.google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: segmentColor,
              strokeOpacity: 0.8,
              strokeWeight: 5,
              map: map.value
            }))
            
            routePolylines.value.push(polyline)
            totalPoints += path.length
          }
        } else {
          // Fallback: Draw straight line between board and alight stops if no geometry
          console.log(`  ⚠️ No geometry for transit segment, drawing straight line`)
          const boardLat = parseFloat(segment.boardStop?.latitude)
          const boardLng = parseFloat(segment.boardStop?.longitude)
          const alightLat = parseFloat(segment.alightStop?.latitude)
          const alightLng = parseFloat(segment.alightStop?.longitude)
          
          if (!isNaN(boardLat) && !isNaN(boardLng) && !isNaN(alightLat) && !isNaN(alightLng)) {
            const fallbackPath = [
              { lat: boardLat, lng: boardLng },
              { lat: alightLat, lng: alightLng }
            ]
            
            const segmentColor = getRouteColor(segment.mode)
            const polyline = markRaw(new window.google.maps.Polyline({
              path: fallbackPath,
              geodesic: true,
              strokeColor: segmentColor,
              strokeOpacity: 0.6,
              strokeWeight: 4,
              map: map.value
            }))
            
            routePolylines.value.push(polyline)
            totalPoints += 2
            console.log(`  Drew fallback line for ${segment.routeName || 'transit'} segment`)
          }
        }
      } else if (segment.type === 'walk') {
        // Draw walking segment as dashed line
        // Parse coordinates as they might be strings or numbers
        const fromLat = parseFloat(segment.from?.latitude)
        const fromLng = parseFloat(segment.from?.longitude)
        const toLat = parseFloat(segment.to?.latitude)
        const toLng = parseFloat(segment.to?.longitude)
        
        console.log(`  Walk segment: [${fromLat.toFixed(5)}, ${fromLng.toFixed(5)}] → [${toLat.toFixed(5)}, ${toLng.toFixed(5)}]`)
        
        // Validate coordinates are valid numbers
        if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(toLat) && !isNaN(toLng)) {
          
          const walkPath = [
            { lat: fromLat, lng: fromLng },
            { lat: toLat, lng: toLng }
          ]
          
          const polyline = markRaw(new window.google.maps.Polyline({
            path: walkPath,
            geodesic: true,
            strokeColor: '#666666',
            strokeOpacity: 0.6,
            strokeWeight: 3,
            icons: [{
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 2
              },
              offset: '0',
              repeat: '10px'
            }],
            map: map.value
          }))
          
          routePolylines.value.push(polyline)
          totalPoints += 2
        } else {
          console.warn('Invalid walking segment coordinates:', segment)
        }
      } else if (segment.type === 'transfer') {
        // For transfer segments, find the previous transit segment to connect it
        const prevSegment = index > 0 ? routeData.segments[index - 1] : null
        
        // Get coordinates from transfer point or surrounding segments
        let fromLat, fromLng, toLat, toLng
        
        if (segment.transferPoint) {
          // Transfer segment has explicit transfer point coordinates
          const transferLat = parseFloat(segment.transferPoint.latitude)
          const transferLng = parseFloat(segment.transferPoint.longitude)
          
          // Draw from previous segment's end to transfer point
          if (prevSegment?.type === 'transit' && prevSegment.alightStop) {
            fromLat = parseFloat(prevSegment.alightStop.latitude)
            fromLng = parseFloat(prevSegment.alightStop.longitude)
            toLat = transferLat
            toLng = transferLng
          }
          
          // If coordinates are valid, draw the connection
          if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(toLat) && !isNaN(toLng)) {
            const transferPath = [
              { lat: fromLat, lng: fromLng },
              { lat: toLat, lng: toLng }
            ]
            
            const polyline = markRaw(new window.google.maps.Polyline({
              path: transferPath,
              geodesic: true,
              strokeColor: '#FF9800', // Orange for transfers
              strokeOpacity: 0.7,
              strokeWeight: 3,
              icons: [{
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  scale: 2
                },
                offset: '0',
                repeat: '8px'
              }],
              map: map.value
            }))
            
            routePolylines.value.push(polyline)
            totalPoints += 2
          }
        }
      }
    })
    
    console.log('Transit route drawn:', totalPoints, 'total points')
    return
  }
  
  // Check if backend provided route geometry/polyline data (for private routes)
  if (routeData.polyline || routeData.geometry || routeData.path) {
    // Use backend route data
    let path = routeData.polyline || routeData.geometry || routeData.path
    
    // If it's an encoded string, decode it
    if (typeof path === 'string') {
      path = decodePolyline(path)
    }
    
    // If it's already an array of coordinates, use it directly
    if (Array.isArray(path) && path.length > 0) {
      const polyline = markRaw(new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map.value
      }))
      
      routePolylines.value.push(polyline)
      console.log('Route drawn from backend data:', routeData.mode, path.length, 'points')
      return
    }
  }
  
  // Fallback: draw straight line with route color
  console.log('No polyline data from backend, drawing straight line')
  drawStraightLine(origin, destination, color)
}

const drawStraightLine = (origin, destination, color = '#3B82F6') => {
  const path = [
    { lat: origin.latitude, lng: origin.longitude },
    { lat: destination.latitude, lng: destination.longitude }
  ]

  const polyline = markRaw(new window.google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 0.7,
    strokeWeight: 4,
    map: map.value
  }))
  
  routePolylines.value.push(polyline)
  console.log('Straight line drawn as fallback')
}

// Decode Google encoded polyline string
const decodePolyline = (encoded) => {
  const poly = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b
    let shift = 0
    let result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat
    
    shift = 0
    result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng
    
    poly.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  
  return poly
}

const getRouteColor = (mode) => {
  const colors = {
    car: '#EF4444',      // Red
    motorcycle: '#F59E0B', // Orange
    bus: '#10B981',      // Green
    mrt: '#3B82F6',      // Blue
    lrt: '#6366F1',      // Indigo
    train: '#8B5CF6',    // Purple
    monorail: '#A855F7', // Purple-light
    bicycle: '#14B8A6',  // Teal
    walking: '#84CC16'   // Lime
  }
  return colors[mode] || '#3B82F6'
}

const clearRoutePolylines = () => {
  routePolylines.value.forEach(polyline => {
    if (polyline) {
      polyline.setMap(null)
    }
  })
  routePolylines.value = []
}

const clearRoutingMarkers = () => {
  if (originMarker.value) {
    originMarker.value.setMap(null)
    originMarker.value = null
  }
  if (destinationMarker.value) {
    destinationMarker.value.setMap(null)
    destinationMarker.value = null
  }
  clearRoutePolylines()
}

// Watch places changes
watch(() => props.places, () => {
  if (isMapLoaded.value && !props.routingMode) {
    throttledUpdateMarkers()
  } else if (isMapLoaded.value && props.routingMode) {
    // Force hide markers if in routing mode
    console.log('Places changed in routing mode - keeping markers hidden')
    markers.value.forEach(marker => marker.setMap(null))
  }
}, { deep: true })

// Watch user location changes
watch(() => props.userLocation, (newLocation) => {
  if (isMapLoaded.value) {
    if (newLocation) {
      createUserLocationMarker()
      // Ensure green place markers still display (but only in search mode)
      if (!props.routingMode) {
        throttledUpdateMarkers()
      }
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
  if (isMapLoaded.value && !props.routingMode) {
    throttledUpdateMarkers()
  } else if (isMapLoaded.value && props.routingMode) {
    // Don't update markers in routing mode
    console.log('Selected place changed in routing mode - ignoring')
  }
})

// Watch routing data changes
watch(() => props.routingData, () => {
  if (isMapLoaded.value) {
    updateRoutingMarkers()
  }
}, { deep: true })

// Watch routing mode changes
watch(() => props.routingMode, (newMode) => {
  if (isMapLoaded.value) {
    console.log(`Routing mode changed to: ${newMode}`)
    console.log(`Total markers to ${newMode ? 'hide' : 'show'}: ${markers.value.length}`)
    
    // Toggle green place markers visibility
    markers.value.forEach(marker => {
      marker.setMap(newMode ? null : map.value)
    })
    
    console.log(`Markers ${newMode ? 'hidden' : 'shown'}`)
    
    if (!newMode) {
      // Clear routing markers when exiting routing mode
      clearRoutingMarkers()
      // Refresh green place markers when returning to search mode
      nextTick(() => {
        throttledUpdateMarkers()
      })
    }
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
  console.log('🧹 GoogleMap component unmounting - cleaning up...')
  
  // Clean up timers
  if (updateMarkersTimer) {
    clearTimeout(updateMarkersTimer)
  }
  if (visibilityTimer) {
    clearTimeout(visibilityTimer)
  }
  
  // ⚠️ CRITICAL: Stop vehicle tracking interval
  if (vehicleRefreshInterval) {
    console.log('🛑 Clearing vehicle refresh interval on component unmount')
    clearInterval(vehicleRefreshInterval)
    vehicleRefreshInterval = null
  }
  
  // Clean up listeners
  if (boundsChangedListener) {
    window.google.maps.event.removeListener(boundsChangedListener)
  }
  
  // Clean up markers
  clearMarkers()
  clearUserLocationMarker()
  clearRoutingMarkers()
  clearVehicleMarkers()
  
  // Clean up state
  visibleMarkers.clear()
  trackingActive.value = false
  trackingRoutes.value = null
  
  if (map.value) {
    map.value = null
  }
  
  console.log('✅ GoogleMap cleanup completed')
})
</script>

<style scoped>
.google-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>