# Next Steps: Complete Map Integration

Quick guide to finish integrating the remaining features from the HTML file.

---

## 🎯 Feature 1: Display Live Vehicle Markers

### Step 1: Add to GoogleMap.vue

```javascript
// Add to imports
import { getRealtimeVehicles } from '@/services/routingApi'

// Add reactive data
const vehicleMarkers = ref([])
let vehicleTrackingInterval = null

// Add method to show live vehicles
const showLiveVehicles = async (routeInfo) => {
  if (!map.value) return
  
  try {
    // Clear existing vehicle markers
    vehicleMarkers.value.forEach(marker => marker.setMap(null))
    vehicleMarkers.value = []
    
    // Fetch vehicle positions
    const data = await getRealtimeVehicles(routeInfo.routes)
    
    if (!data.vehicles || data.vehicles.length === 0) {
      console.log('No live vehicles found')
      return
    }
    
    // Create markers for each vehicle
    data.vehicles.forEach(vehicle => {
      const icon = vehicle.bearing !== null ? {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 8,
        fillColor: '#EF4444', // Red for buses
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        rotation: vehicle.bearing
      } : {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
      
      const marker = new google.maps.Marker({
        position: { lat: vehicle.latitude, lng: vehicle.longitude },
        map: map.value,
        icon: icon,
        title: `Vehicle ${vehicle.vehicle_id}`,
        zIndex: 1000
      })
      
      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>Vehicle ${vehicle.vehicle_id}</strong><br>
            Route: ${vehicle.route_id}<br>
            Speed: ${vehicle.speed || 'N/A'} km/h
          </div>
        `
      })
      
      marker.addListener('click', () => {
        infoWindow.open(map.value, marker)
      })
      
      vehicleMarkers.value.push(marker)
    })
    
    console.log(`✅ Displayed ${vehicleMarkers.value.length} live vehicles`)
    
    // Start auto-refresh
    startVehicleTracking(routeInfo)
    
  } catch (error) {
    console.error('Error showing live vehicles:', error)
  }
}

// Auto-refresh vehicles every 25 seconds
const startVehicleTracking = (routeInfo) => {
  if (vehicleTrackingInterval) {
    clearInterval(vehicleTrackingInterval)
  }
  
  vehicleTrackingInterval = setInterval(() => {
    showLiveVehicles(routeInfo)
  }, 25000)
}

// Stop tracking
const stopVehicleTracking = () => {
  if (vehicleTrackingInterval) {
    clearInterval(vehicleTrackingInterval)
    vehicleTrackingInterval = null
  }
  
  // Clear markers
  vehicleMarkers.value.forEach(marker => marker.setMap(null))
  vehicleMarkers.value = []
}

// Cleanup on unmount
onUnmounted(() => {
  stopVehicleTracking()
})

// Expose methods
defineExpose({
  showLiveVehicles,
  stopVehicleTracking
})
```

---

## 🎯 Feature 2: Draw Transit Route Polylines

### Add to GoogleMap.vue

```javascript
// Add method to draw transit route
const drawTransitRoute = (scenario) => {
  if (!map.value || !scenario.segments) return
  
  // Clear existing overlays
  clearRouteOverlays()
  
  const bounds = new google.maps.LatLngBounds()
  
  scenario.segments.forEach(segment => {
    if (segment.type === 'walk') {
      // Draw walking segment
      if (segment.coordinates && segment.coordinates.length > 0) {
        const path = segment.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1]
        }))
        
        const polyline = new google.maps.Polyline({
          path: path,
          strokeColor: '#F59E0B', // Orange for walking
          strokeOpacity: 0.7,
          strokeWeight: 4,
          geodesic: true,
          map: map.value
        })
        
        routePolylines.value.push(polyline)
        path.forEach(p => bounds.extend(p))
      }
    } else if (segment.type === 'transit') {
      // Draw transit segment
      if (segment.coordinates && segment.coordinates.length > 0) {
        const path = segment.coordinates.map(coord => ({
          lat: coord[0],
          lng: coord[1]
        }))
        
        const color = getTransitColor(segment.category || segment.mode)
        
        const polyline = new google.maps.Polyline({
          path: path,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 6,
          geodesic: true,
          map: map.value
        })
        
        routePolylines.value.push(polyline)
        path.forEach(p => bounds.extend(p))
        
        // Add markers for board/alight stops
        if (segment.boardStop) {
          const boardMarker = new google.maps.Marker({
            position: { 
              lat: segment.boardStop.latitude, 
              lng: segment.boardStop.longitude 
            },
            map: map.value,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            },
            title: `Board: ${segment.boardStop.name}`
          })
          
          routePolylines.value.push(boardMarker)
        }
        
        if (segment.alightStop) {
          const alightMarker = new google.maps.Marker({
            position: { 
              lat: segment.alightStop.latitude, 
              lng: segment.alightStop.longitude 
            },
            map: map.value,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            },
            title: `Alight: ${segment.alightStop.name}`
          })
          
          routePolylines.value.push(alightMarker)
        }
      }
    }
  })
  
  // Fit map to route
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds, { padding: 50 })
  }
}

// Helper function for transit colors
const getTransitColor = (type) => {
  const colors = {
    'rapid-rail-kl': '#10B981',  // Green for MRT/LRT
    'rapid-bus-kl': '#3B82F6',   // Blue for buses
    'rapid-bus-mrtfeeder': '#8B5CF6', // Purple for feeder
    'ktmb': '#EF4444',           // Red for trains
    'mrt': '#10B981',
    'lrt': '#10B981',
    'bus': '#3B82F6',
    'train': '#EF4444'
  }
  return colors[type] || '#6B7280'
}

// Clear route overlays
const clearRouteOverlays = () => {
  routePolylines.value.forEach(overlay => {
    if (overlay.setMap) {
      overlay.setMap(null)
    }
  })
  routePolylines.value = []
}
```

---

## 🎯 Feature 3: Add "Show Live Vehicles" Button

### Update RouteComparison.vue

Add button to each transit route card:

```vue
<template>
  <!-- Inside the route card, after the emission bar -->
  <div v-if="scenario.category === 'public' && scenario.hasRealtime" class="mt-3">
    <button
      @click.stop="showLiveVehicles(scenario)"
      class="w-full px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
    >
      📍 Show Live Vehicles
    </button>
  </div>
</template>

<script setup>
// Add method
const showLiveVehicles = (scenario) => {
  if (!scenario.segments) return
  
  // Extract route info from segments
  const routes = scenario.segments
    .filter(s => s.type === 'transit' && (s.mode === 'bus' || s.category === 'ktmb'))
    .map(s => ({
      category: s.category,
      routeId: s.routeId || s.route_id,
      options: {
        minutesOld: 2,
        directionId: s.directionId || 0
      }
    }))
  
  if (routes.length === 0) {
    console.log('No trackable vehicles for this route')
    return
  }
  
  // Emit to parent/map component
  emit('show-live-vehicles', { routes })
}
</script>
```

---

## 🎯 Feature 4: Connect Components in GreenPlaces.vue

### Update the parent component

```vue
<template>
  <div>
    <RouteComparison
      @route-selected="handleRouteSelected"
      @show-live-vehicles="handleShowLiveVehicles"
    />
    
    <GoogleMap
      ref="mapRef"
      :routing-data="selectedRoute"
    />
  </div>
</template>

<script setup>
const mapRef = ref(null)
const selectedRoute = ref(null)

const handleRouteSelected = (data) => {
  selectedRoute.value = data
  
  // Draw route on map
  if (mapRef.value && data.scenario.category === 'public') {
    mapRef.value.drawTransitRoute(data.scenario)
  }
}

const handleShowLiveVehicles = (routeInfo) => {
  if (mapRef.value) {
    mapRef.value.showLiveVehicles(routeInfo)
  }
}
</script>
```

---

## 🧪 Testing Checklist

Once implemented, test these:

- [ ] Search for a route (e.g., KLCC to KL Sentral)
- [ ] Verify transit routes appear in list
- [ ] Click on a transit route - polylines should draw on map
- [ ] Verify board/alight stop markers appear
- [ ] Click "Show Live Vehicles" button
- [ ] Verify red vehicle markers appear on map
- [ ] Verify vehicles refresh every 25 seconds
- [ ] Click on a vehicle marker - info window should show
- [ ] Test all 5 sorting options
- [ ] Verify route list reorders correctly

---

## 📚 Reference Implementation

See complete working example in:
`C:\GitRepo\greenpulse-backend-iter3\public\google-map-routing.html`

Key sections:
- Lines 2082-2305: Vehicle tracking
- Lines 1800-2080: Transit route drawing
- Lines 1500-1800: Polyline rendering

---

## 💡 Pro Tips

1. **Start simple**: Get vehicle markers working first, then add polylines
2. **Test incremental**: Test each feature separately before combining
3. **Use console.log**: Add plenty of logging to debug data flow
4. **Check data structure**: Log `scenario.segments` to see what data you have
5. **Handle errors**: Wrap everything in try/catch blocks

---

## 🎉 When Complete

You'll have a fully-featured transit routing map with:
- ✅ Live vehicle tracking
- ✅ Multi-modal route comparison
- ✅ Advanced sorting algorithms  
- ✅ Beautiful route visualization
- ✅ Real-time position updates

Good luck! The hard part is done - you've got all the APIs working! 🚀

