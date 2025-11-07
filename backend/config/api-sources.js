/**
 * Multi-Source API Configuration
 * Wandrly uses MULTIPLE data sources for maximum accuracy and reliability
 * Better than MakeMyTrip/IRCTC because we aggregate from multiple sources!
 */

module.exports = {
  // Flight Data Sources (We use MULTIPLE sources for best prices!)
  flights: {
    primary: [
      {
        name: 'Amadeus',
        enabled: true,
        priority: 1,
        features: ['real_time_pricing', 'availability', 'multiple_airlines'],
        coverage: 'global'
      },
      {
        name: 'Kiwi.com',
        enabled: true,
        priority: 2,
        features: ['price_comparison', 'virtual_interlining', 'cheap_flights'],
        coverage: 'global',
        apiUrl: 'https://api.tequila.kiwi.com'
      },
      {
        name: 'AviationStack',
        enabled: true,
        priority: 3,
        features: ['flight_status', 'schedules', 'real_time'],
        coverage: 'global'
      }
    ],
    aggregation: {
      enabled: true,
      mergeResults: true,
      deduplication: true,
      priceComparison: true
    }
  },

  // Hotel Data Sources (Multiple sources for best deals!)
  hotels: {
    primary: [
      {
        name: 'Booking.com',
        enabled: true,
        priority: 1,
        features: ['real_availability', 'reviews', 'photos'],
        coverage: 'global',
        apiHost: 'booking-com.p.rapidapi.com'
      },
      {
        name: 'Hotels.com',
        enabled: true,
        priority: 2,
        features: ['price_comparison', 'rewards'],
        coverage: 'global',
        apiHost: 'hotels-com-provider.p.rapidapi.com'
      },
      {
        name: 'Agoda',
        enabled: true,
        priority: 3,
        features: ['asia_focus', 'competitive_pricing'],
        coverage: 'asia',
        apiHost: 'agoda-com.p.rapidapi.com'
      }
    ],
    aggregation: {
      enabled: true,
      mergeResults: true,
      findBestPrice: true
    }
  },

  // Indian Railway Data (Better than IRCTC!)
  trains: {
    primary: [
      {
        name: 'RailYatri',
        enabled: true,
        priority: 1,
        features: ['real_time_status', 'pnr_prediction', 'seat_availability'],
        coverage: 'india',
        apiUrl: 'https://railyatri.p.rapidapi.com'
      },
      {
        name: 'ConfirmTkt',
        enabled: true,
        priority: 2,
        features: ['prediction', 'alternative_trains', 'seat_availability'],
        coverage: 'india',
        apiUrl: 'https://confirmtkt.p.rapidapi.com'
      },
      {
        name: 'IRCTC_API',
        enabled: true,
        priority: 3,
        features: ['official_data', 'booking'],
        coverage: 'india'
      }
    ],
    features: {
      pnrPrediction: true,
      alternativeSuggestions: true,
      smartBooking: true
    }
  },

  // Bus Data Sources (Real-time bus bookings!)
  buses: {
    primary: [
      {
        name: 'RedBus',
        enabled: true,
        priority: 1,
        features: ['real_time', 'seat_selection', 'live_tracking'],
        coverage: 'india',
        apiUrl: 'https://developer.redbus.in'
      },
      {
        name: '12Go Asia',
        enabled: true,
        priority: 2,
        features: ['asia_coverage', 'multi_transport'],
        coverage: 'asia',
        apiUrl: 'https://12go.asia/api'
      },
      {
        name: 'AbhiBus',
        enabled: true,
        priority: 3,
        features: ['south_india_focus'],
        coverage: 'india'
      }
    ]
  },

  // Ride Sharing (Real-time estimates!)
  rides: {
    primary: [
      {
        name: 'Ola',
        enabled: true,
        priority: 1,
        features: ['india_coverage', 'real_time_pricing'],
        coverage: 'india'
      },
      {
        name: 'Uber',
        enabled: true,
        priority: 2,
        features: ['global_coverage', 'price_estimates'],
        coverage: 'global',
        apiUrl: 'https://api.uber.com/v1.2'
      },
      {
        name: 'Rapido',
        enabled: true,
        priority: 3,
        features: ['bike_rides', 'affordable'],
        coverage: 'india'
      }
    ]
  },

  // Weather Data
  weather: {
    primary: [
      {
        name: 'OpenWeather',
        enabled: true,
        priority: 1,
        features: ['accurate', 'global', 'forecast'],
        coverage: 'global'
      }
    ]
  },

  // Places Data
  places: {
    primary: [
      {
        name: 'OpenStreetMap',
        enabled: true,
        priority: 1,
        features: ['free', 'comprehensive', 'accurate'],
        coverage: 'global'
      },
      {
        name: 'Google Places',
        enabled: true,
        priority: 2,
        features: ['photos', 'reviews', 'verified'],
        coverage: 'global'
      }
    ]
  }
};

