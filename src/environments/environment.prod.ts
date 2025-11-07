// Production environment configuration
// Note: Frontend doesn't need these API keys - backend handles all API calls!

export const environment = {
  production: true,
  
  googlePlaces: {
    apiKey: '',  // Not used in frontend (backend handles it)
    enabled: false
  },

  openWeather: {
    apiKey: '724b2996b7c101c6669520e167bb44dc',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    enabled: true
  },

  amadeus: {
    clientId: '',  // Not used in frontend (backend handles it)
    clientSecret: '',
    baseUrl: 'https://api.amadeus.com',
    enabled: false
  },

  rapidApi: {
    apiKey: '',  // Not used in frontend (backend handles it)
    enabled: false,
    endpoints: {
      hotels: 'https://booking-com.p.rapidapi.com/v1',
      trains: 'https://irctc1.p.rapidapi.com',
      buses: 'https://redbus.p.rapidapi.com'
    }
  },

  uber: {
    serverToken: '',  // Not used in frontend (backend handles it)
    baseUrl: 'https://api.uber.com/v1.2',
    enabled: false
  },

  useMockData: false
};

