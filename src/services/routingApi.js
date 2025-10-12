import api from './api.js'

/**
 * Routing API Service
 * Provides carbon emission comparison across transport modes
 */

/**
 * Compare carbon emissions across transport modes (Quick - top 5 options)
 */
export const quickCompare = async (origin, destination) => {
  try {
    const response = await api.post('/api/routing/compare/quick', {
      origin,
      destination
    })
    return response.data
  } catch (error) {
    console.error('Error in quick comparison:', error)
    throw error
  }
}

/**
 * Compare carbon emissions across all transport modes
 * Fetches both private vehicle routes AND public transit routes
 */
export const compareRoutes = async (origin, destination, options = {}) => {
  try {
    // Fetch private vehicle routes (car, bike, walk, motorcycle)
    // OSRM routing can take time, especially for long distances
    const privatePromise = api.post('/api/routing/compare', {
      origin,
      destination,
      options,
      userId: options.userId || null
    }, {
      timeout: 30000 // 30 second timeout for private routes
    })
    
    // Fetch public transit routes (MRT, LRT, Bus, KTMB)
    // Transit route calculation can take longer due to complex queries
    const transitPromise = api.post('/api/routing/transit/plan', {
      origin,
      destination
    }, {
      timeout: 60000 // 60 second timeout to match Vercel maxDuration
    }).catch(err => {
      // Don't fail entire request if transit routes not available
      console.warn('Transit routes not available:', err.message)
      return { data: { success: false, data: { routes: [] } } }
    })
    
    // Wait for both requests to complete
    const [privateResponse, transitResponse] = await Promise.all([privatePromise, transitPromise])
    
    const privateData = privateResponse.data
    const transitData = transitResponse.data
    
    // Merge results and normalize field names
    const allScenarios = (privateData.data?.scenarios || []).map(scenario => ({
      ...scenario,
      // Normalize emissions field name from carbonEmissions to emissions
      emissions: scenario.carbonEmissions !== undefined ? scenario.carbonEmissions : scenario.emissions
    }))
    
    // Add transit routes to scenarios if available
    if (transitData.success && transitData.data?.routes) {
      transitData.data.routes.forEach((route, index) => {
        const segments = route.steps || route.segments || []
        console.log(`Transit Route ${index + 1}: ${segments.length} segments`)
        
        allScenarios.push({
          id: `transit-${index}`,
          name: `Transit Route ${index + 1}`,
          mode: 'transit',
          category: 'public',
          distance: route.totalDistance || 0,
          duration: route.totalDuration || 0,
          emissions: route.totalEmissions || 0,
          rank: allScenarios.length + 1,
          // Include full route data for rendering (backend returns 'steps', map to 'segments')
          segments: segments,
          hasRealtime: route.hasRealtime || false
        })
      })
    }
    
    // Recalculate ranks based on emissions
    allScenarios.sort((a, b) => a.emissions - b.emissions)
    allScenarios.forEach((scenario, index) => {
      scenario.rank = index + 1
    })
    
    // Calculate emissions comparison metrics
    if (allScenarios.length > 0) {
      const worstEmissions = Math.max(...allScenarios.map(s => s.emissions))
      const bestEmissions = Math.min(...allScenarios.map(s => s.emissions))
      
      console.log(`Emissions range: ${bestEmissions.toFixed(3)} - ${worstEmissions.toFixed(3)} kg CO2`)
      
      allScenarios.forEach(scenario => {
        scenario.emissionsVsWorst = worstEmissions > 0 
          ? Math.round((scenario.emissions / worstEmissions) * 100) 
          : 100
        scenario.savingsVsWorst = worstEmissions - scenario.emissions
        scenario.savingsVsBest = scenario.emissions - bestEmissions
      })
    }
    
    // Return merged response
    return {
      success: true,
      data: {
        ...privateData.data,
        scenarios: allScenarios,
        totalScenarios: allScenarios.length,
        hasTransit: transitData.success && transitData.data?.routes?.length > 0
      }
    }
  } catch (error) {
    console.error('Error comparing routes:', error)
    throw error
  }
}

/**
 * Calculate distance between two points
 */
export const calculateDistance = async (origin, destination) => {
  try {
    const response = await api.get('/api/routing/distance', {
      params: {
        originLat: origin.latitude,
        originLon: origin.longitude,
        destLat: destination.latitude,
        destLon: destination.longitude
      }
    })
    return response.data
  } catch (error) {
    console.error('Error calculating distance:', error)
    throw error
  }
}

/**
 * Calculate emissions for specific mode and distance
 */
export const calculateEmissions = async (distance, mode, size, fuelType) => {
  try {
    const response = await api.post('/api/routing/emissions', {
      distance,
      mode,
      size,
      fuelType
    })
    return response.data
  } catch (error) {
    console.error('Error calculating emissions:', error)
    throw error
  }
}

/**
 * Get all emission factors
 */
export const getEmissionFactors = async () => {
  try {
    const response = await api.get('/api/routing/emission-factors')
    return response.data
  } catch (error) {
    console.error('Error getting emission factors:', error)
    throw error
  }
}

/**
 * Get real-time vehicle positions for specific routes
 * @param {Array} routes - Array of route objects with {category, routeId, options}
 * @returns {Promise} Vehicle positions
 */
export const getRealtimeVehicles = async (routes) => {
  try {
    const routesParam = encodeURIComponent(JSON.stringify(routes))
    // Use longer timeout for real-time data (can be slow on first fetch)
    const response = await api.get(`/api/routing/realtime/vehicles-for-route?routes=${routesParam}`, {
      timeout: 30000 // 30 second timeout for real-time vehicle data
    })
    return response.data
  } catch (error) {
    console.error('Error getting realtime vehicles:', error)
    throw error
  }
}

/**
 * Check health of realtime service
 */
export const checkRealtimeHealth = async () => {
  try {
    const response = await api.get('/api/routing/realtime/health')
    return response.data
  } catch (error) {
    console.error('Error checking realtime health:', error)
    throw error
  }
}

