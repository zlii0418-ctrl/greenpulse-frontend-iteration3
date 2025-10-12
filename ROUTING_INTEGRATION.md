# Route Comparison Feature Integration

## Overview

This document describes the integration of the map routing and carbon emission comparison features into the GreenPulse frontend application under the `/green-places` page.

## Features Implemented

### 1. Toggle Between Search and Routing Modes

- Added a toggle bar with two buttons:
  - **Search Places**: Default mode for searching and viewing green places
  - **Route Comparison**: New mode for comparing carbon emissions across transport modes

### 2. Route Comparison UI

A new sidebar component that allows users to:
- **Text Input with Geocoding**: Type addresses or place names with Google Places Autocomplete
- **Map Clicking**: Set origin and destination by clicking on the map
- **GPS Location**: Use current location as origin with one click
- Choose between Quick (Top 5) or Full comparison
- View carbon emission comparisons for different transport modes:
  - Private vehicles (cars, motorcycles) with various fuel types
  - Public transport (bus, MRT, LRT, train)
  - Active transport (bicycle, walking)

### 3. Interactive Map Features

- Visual markers for origin (green pin with "A") and destination (red pin with "B")
- Route visualization with a blue polyline between points
- Click on map to set origin/destination locations
- Automatic zoom and centering based on route

### 4. Comparison Results Display

For each transport option, displays:
- Transport mode with emoji icon
- Distance, duration, and emissions
- Ranking (#1 = lowest emissions)
- Visual emission bar chart
- Percentage comparison vs worst option
- Carbon savings calculation

## Files Created/Modified

### New Files

1. **`src/services/routingApi.js`**
   - API service for routing endpoints
   - Functions: `quickCompare()`, `compareRoutes()`, `calculateDistance()`, `calculateEmissions()`, `getEmissionFactors()`

2. **`src/views/greenplaces/components/RouteComparison.vue`**
   - Sidebar component for route comparison UI
   - Handles origin/destination input
   - Displays comparison results
   - Manages route selection

### Modified Files

1. **`src/views/greenplaces/GreenPlaces.vue`**
   - Added toggle bar for mode switching
   - Integrated RouteComparison component
   - Added routing state management
   - Added map click handlers for location selection

2. **`src/views/greenplaces/components/GoogleMap.vue`**
   - Added routing mode support
   - Added origin/destination markers with custom icons
   - Added route polyline rendering
   - Added map click event for routing mode

## API Integration

The frontend connects to the backend routing API:

### Base URL
- Development: Uses Vite proxy (empty `VITE_API_URL`)
- Production: `https://gp-backend-iter2.vercel.app`

### Endpoints Used

1. **POST `/api/routing/compare/quick`**
   - Quick comparison (top 5 transport options)
   - Payload: `{ origin: {latitude, longitude}, destination: {latitude, longitude} }`

2. **POST `/api/routing/compare`**
   - Full comparison (all transport options)
   - Payload: `{ origin, destination, options, userId }`

## Usage

### User Flow

1. Navigate to `/green-places`
2. Click "Route Comparison" button to enter routing mode
3. Set origin location using one of these methods:
   - **Type address**: Start typing in the origin field, select from autocomplete suggestions
   - **Use GPS**: Click "Use GPS" button to use current location
   - **Click map**: Click anywhere on the map
4. Set destination location:
   - **Type address**: Start typing in the destination field, select from suggestions
   - **Click map**: Click anywhere on the map
5. Choose Quick or Full comparison
6. Click "Compare Routes"
7. View emission comparisons and select best option
8. See route visualized on map with A→B markers

### Geocoding Features

The text inputs support:
- **Address autocomplete**: Real-time suggestions as you type
- **Place names**: Search by landmark, business, or place name
- **Malaysia focused**: Autocomplete prioritizes Malaysian locations
- **Formatted addresses**: Shows full addresses with proper formatting
- **Coordinates display**: Shows lat/lng below each location when set

### Switching Modes

- Click "Search Places" to return to place search functionality
- Click "Route Comparison" to access routing features
- Map automatically clears routing markers when switching to search mode

## Transport Mode Icons

- 🚗 Car
- 🏍️ Motorcycle
- 🚌 Bus
- 🚇 MRT
- 🚈 LRT
- 🚆 Train
- 🚝 Monorail
- 🚲 Bicycle
- 🚶 Walking

## Visual Design

### Color Coding

- **Green (#10B981)**: Best/low emission options, origin marker
- **Blue (#3B82F6)**: Mid-range options, route line
- **Yellow (#EAB308)**: Higher emission options
- **Red (#EF4444)**: Worst emission options, destination marker

### Ranking System

- #1: Best (lowest emissions) - Green
- #2-3: Good - Blue
- #4-5: Moderate - Yellow
- #6+: Poor - Gray

## Technical Notes

### Performance Optimizations

- Lazy loading of routing data
- Efficient marker management
- Debounced map updates
- Minimal re-renders with proper reactive state

### Map Integration

- Uses existing Google Maps instance
- Reuses map components and infrastructure
- Clean separation between search and routing modes
- Proper cleanup on mode switching

### Error Handling

- API error messages displayed to user
- Loading states for async operations
- Graceful fallbacks for missing data
- Console logging for debugging

## Backend Requirements

The feature requires the backend routing service to be running with:

1. Database schema for route comparisons
2. Emission factor data loaded
3. OSRM routing service accessible (or fallback to straight-line calculation)
4. Proper CORS configuration

### Backend Setup

```bash
# In backend repository
npm run setup-routing
npm start
```

## Future Enhancements

Potential improvements:

1. **Real Route Paths**: Integrate Google Directions API for actual road routes
2. **Multi-leg Journeys**: Support mixed transport modes
3. **Route History**: Save and retrieve user's previous comparisons
4. **Route Optimization**: Suggest alternative routes to minimize emissions
5. **Real-time Transit**: Include real-time public transport schedules
6. **Carbon Offset**: Suggest carbon offset options for chosen route
7. **Share Routes**: Allow users to share route comparisons

## Troubleshooting

### Map Not Showing Routing Features

1. Ensure `viewMode === 'routing'` is true
2. Check that origin and destination are set
3. Verify routing data is passed to GoogleMap component
4. Check browser console for errors

### API Errors

1. Verify backend is running
2. Check network tab for failed requests
3. Ensure API URL is correctly configured
4. Verify backend has routing service set up

### Location Selection Not Working

1. Check that map click listener is active in routing mode
2. Verify RouteComparison component has exposed methods
3. Check that routeComparisonRef is properly connected
4. Ensure selectingFor state is being set

## Support

For issues or questions:

1. Check browser console for error messages
2. Review backend logs
3. Test API endpoints directly with curl/Postman
4. Verify environment variables are set correctly

## Credits

- Backend routing service: `C:\GitRepo\greenpulse-backend-iter3`
- Sample UI reference: `public/google-map-routing.html` (backend repo)
- Documentation: `guides/ROUTING_FRONTEND_INTEGRATION.md` (backend repo)

