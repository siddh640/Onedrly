// Environment configuration for Onedrly Frontend
// Note: API keys are managed by backend server for security!
// Frontend only needs to know backend URL

export const environment = {
  production: false,
  
  // Backend API URL (your custom API server)
  backendUrl: 'http://localhost:3000/api',
  
  // Google Places API (used directly by frontend for some features)
  googlePlaces: {
    apiKey: '', // Optional - backend handles most place queries
    enabled: false
  },

  // OpenWeather API (for weather data)
  openWeather: {
    apiKey: '724b2996b7c101c6669520e167bb44dc',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    enabled: true
  },

  // These are handled by backend - frontend doesn't need them
  amadeus: {
    clientId: '',
    clientSecret: '',
    baseUrl: 'https://test.api.amadeus.com',
    enabled: false
  },

  rapidApi: {
    apiKey: '',
    enabled: false,
    endpoints: {
      hotels: 'https://booking-com.p.rapidapi.com/v1',
      trains: 'https://irctc1.p.rapidapi.com',
      buses: 'https://redbus.p.rapidapi.com'
    }
  },

  uber: {
    serverToken: '',
    baseUrl: 'https://api.uber.com/v1.2',
    enabled: false
  },

  // Backend handles data fetching
  useMockData: false
};

