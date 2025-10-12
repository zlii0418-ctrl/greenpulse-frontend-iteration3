/**
 * Dummy bus data for testing live vehicle tracking on the map
 */

export const createDummyBusData = () => {
  const now = new Date().toISOString();
  const timestamp = Date.now();

  return {
    success: true,
    routes: [
      { category: 'rapid-bus-kl', routeId: 'U7718' },
      { category: 'rapid-bus-kl', routeId: 'U7700' }
    ],
    data: {
      success: true,
      vehicles: [
        // Bus 1: Route 771 near SS15 (heading towards Sunway)
        {
          vehicle_id: 'TEST_BUS_771_001',
          trip_id: 'TEST_TRIP_771',
          route_id: 'U7718',
          routeId: 'U7718',
          direction_id: 0,
          latitude: 3.0740,
          longitude: 101.5910,
          bearing: 90.0,
          speed: 35.5,
          current_status: 'IN_TRANSIT_TO',
          position_timestamp: timestamp,
          vehicle_label: '🚌 771 Test Bus',
          vehicleId: 'TEST_BUS_771_001',
          created_at: now
        },
        // Bus 2: Route 770 near USJ
        {
          vehicle_id: 'TEST_BUS_770_001',
          trip_id: 'TEST_TRIP_770',
          route_id: 'U7700',
          routeId: 'U7700',
          direction_id: 0,
          latitude: 3.0650,
          longitude: 101.5950,
          bearing: 180.0,
          speed: 28.3,
          current_status: 'IN_TRANSIT_TO',
          position_timestamp: timestamp,
          vehicle_label: '🚌 770 Express',
          vehicleId: 'TEST_BUS_770_001',
          created_at: now
        },
        // Bus 3: Route 771 near Sunway Pyramid (opposite direction)
        {
          vehicle_id: 'TEST_BUS_771_002',
          trip_id: 'TEST_TRIP_771_B',
          route_id: 'U7718',
          routeId: 'U7718',
          direction_id: 1,
          latitude: 3.0720,
          longitude: 101.6050,
          bearing: 270.0,
          speed: 42.1,
          current_status: 'STOPPED_AT',
          position_timestamp: timestamp,
          vehicle_label: '🚌 771 Night Service',
          vehicleId: 'TEST_BUS_771_002',
          created_at: now
        },
        // Bus 4: Route 771 at Sunway Pyramid
        {
          vehicle_id: 'TEST_BUS_771_003',
          trip_id: 'TEST_TRIP_771_C',
          route_id: 'U7718',
          routeId: 'U7718',
          direction_id: 0,
          latitude: 3.0730,
          longitude: 101.6070,
          bearing: 45.0,
          speed: 15.2,
          current_status: 'STOPPED_AT',
          position_timestamp: timestamp,
          vehicle_label: '🚌 771 Local',
          vehicleId: 'TEST_BUS_771_003',
          created_at: now
        }
      ],
      count: 4,
      timestamp: now
    },
    vehicleCount: 4,
    timestamp: now
  };
};

export const getDummyRoutes = () => {
  return [
    {
      category: 'rapid-bus-kl',
      routeId: 'U7718',
      options: {
        minutesOld: 2
      }
    },
    {
      category: 'rapid-bus-kl',
      routeId: 'U7700',
      options: {
        minutesOld: 2
      }
    }
  ];
};

// Expose to window for easy testing from console
if (typeof window !== 'undefined') {
  window.createDummyBusData = createDummyBusData;
  window.getDummyRoutes = getDummyRoutes;
}

