# 🚀 Wandrly Backend API

> Unified backend API for the Wandrly travel platform

## Features

- ✅ **7 API Endpoints** - Flights, hotels, trains, buses, rides, weather, places
- ✅ **Smart Caching** - 5-minute cache for better performance
- ✅ **Rate Limiting** - Prevent abuse (100 req/15min)
- ✅ **Security** - Helmet, CORS, input validation
- ✅ **Real API Integration** - Amadeus, RapidAPI, OpenWeather
- ✅ **Automatic Fallback** - Enhanced mock data if APIs fail
- ✅ **Production Ready** - Deploy anywhere

## Quick Start

```bash
npm install
npm start
```

Server runs on: http://localhost:3000

## API Endpoints

### Health Check
```
GET /health
```

### Weather
```
GET /api/weather/:city
GET /api/weather/:city/forecast
```

### Places
```
GET /api/places/search/:destination
```

### Travel
```
POST /api/flights/search
POST /api/hotels/search
POST /api/trains/search
POST /api/buses/search
POST /api/rides/estimate
```

## Configuration

1. Copy `env.example` to `.env`
2. Add your API keys
3. Restart server

## Dependencies

- express - Web framework
- axios - HTTP client
- cors - CORS support
- helmet - Security
- node-cache - Caching
- compression - Response compression
- express-rate-limit - Rate limiting

## Environment Variables

See `env.example` for full list.

Required:
- `PORT` - Server port (default: 3000)
- `OPENWEATHER_API_KEY` - Weather data

Optional (for real data):
- `AMADEUS_CLIENT_ID` - Flight data
- `AMADEUS_CLIENT_SECRET` - Flight data
- `RAPIDAPI_KEY` - Hotels/trains/buses

## Development

```bash
npm install
npm run dev  # Auto-restart on changes
```

## Production

```bash
NODE_ENV=production npm start
```

## License

MIT

## Author

Wandrly Team

