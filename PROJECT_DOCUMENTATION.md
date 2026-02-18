# Onedrly – Project Documentation

**Full project details for PDF / copy-paste**

---

## 1. Project Overview

**Name:** Onedrly (destination-information)  
**Type:** Travel booking and destination information platform  
**Stack:** Angular 20 (frontend) + Node.js/Express (backend)

Onedrly is a modern, worldwide travel booking platform with real-time data for flights, trains, buses, hotels, and rides. It includes place discovery, weather, user accounts, bookings, favorites, search history, reviews, and trip planning.

---

## 2. Features

### Travel Booking
- **Flights** – Worldwide coverage, 40+ cities; Amadeus API for real flight data
- **Trains** – India, Japan, Europe, China; RailYatri/IRCTC-style data via RapidAPI
- **Buses** – Regional and intercity
- **Hotels** – 2–5 star options globally; Booking.com via RapidAPI
- **Rides** – Uber/Ola-style estimates

### Place Discovery
- Real place data (Google Places API when configured)
- Photos and reviews
- Attractions, restaurants, shopping
- Ratings and user reviews

### Weather
- Current conditions
- 5-day forecast
- Temperature, humidity, wind (OpenWeather API)

### User Management (MongoDB)
- Register / login (JWT)
- Profile and preferences
- Bookings (create, list, filter, cancel)
- Favorites (destinations, etc.)
- Search history and popular destinations
- Reviews (create, list, update, delete)
- Trips (create, itinerary, add bookings/photos)

### AI Assistant
- Onedrly AI routes and assistant endpoints
- Trip and travel assistance

### Medical Tourism
- Dedicated medical-tourism API route

---

## 3. Technologies Used

### Frontend
- Angular 20.x
- TypeScript 5.8
- RxJS 7.8
- CSS3 (glass morphism, 3D-style animations)

### Backend
- Node.js (≥18)
- Express 4.x
- MongoDB (Mongoose) – user data, bookings, favorites, etc.
- JWT (jsonwebtoken), bcryptjs, express-validator
- Axios, node-cache, helmet, compression, morgan, express-rate-limit
- OpenAI integration (openai package)
- dotenv for configuration

### APIs (backend)
- OpenWeather API – weather
- Google Places API – places (optional)
- Amadeus – flights (when keys set)
- RapidAPI – hotels (Booking.com), trains (RailYatri)
- Optional: Unsplash, Uber, Kiwi, AviationStack (env-driven)

---

## 4. Project Structure

```
destination-information/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── components/           # UI components
│   │   ├── services/             # API services
│   │   └── app.css
│   └── styles.css
├── backend/
│   ├── server.js                 # Main Express app
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── routes/
│   │   ├── weather.js
│   │   ├── places.js
│   │   ├── google-places.js
│   │   ├── flights.js
│   │   ├── hotels.js
│   │   ├── trains.js
│   │   ├── buses.js
│   │   ├── rides.js
│   │   ├── medical-tourism.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── bookings.js
│   │   ├── favorites.js
│   │   ├── search-history.js
│   │   ├── reviews.js
│   │   ├── trips.js
│   │   ├── assistant.js
│   │   └── onedrly-ai.js
│   ├── services/                 # Business logic, aggregators, API calls
│   ├── ai/                       # AI data (e.g. knowledge-base, patterns)
│   ├── package.json
│   ├── .env                      # API keys and config (create from env.example)
│   └── README.md
├── package.json                  # Angular app
├── angular.json
├── README.md
├── HOW_TO_RUN.md
├── YOUR_ENV_FILE_GUIDE.md
├── NEW_DESIGN_FEATURES.md
├── API_ENDPOINTS.md
└── PROJECT_DOCUMENTATION.md      # This file
```

---

## 5. How to Run

### Prerequisites
- Node.js v18 or higher
- npm
- (Optional) MongoDB for user management, bookings, favorites, etc.

### Install

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Start

**Terminal 1 – Backend**
```bash
cd backend
node server.js
```
Server runs at `http://localhost:3000` (or `PORT` in `.env`).

**Terminal 2 – Frontend**
```bash
npm start
```
App runs at `http://localhost:4200`.

### Health check
- Backend: `http://localhost:3000/health`
- API metrics: `http://localhost:3000/api/metrics`

---

## 6. Environment Configuration (backend/.env)

Create `backend/.env` (copy from `backend/env.example` if present). Main variables:

| Variable | Purpose |
|----------|---------|
| PORT | Server port (default 3000) |
| NODE_ENV | development / production |
| MONGODB_URI | MongoDB connection string (required for user features) |
| OPENWEATHER_API_KEY | Weather data |
| GOOGLE_PLACES_API_KEY | Optional – better place data |
| AMADEUS_CLIENT_ID | Optional – real flight data |
| AMADEUS_CLIENT_SECRET | Optional – real flight data |
| AMADEUS_BASE_URL | e.g. https://test.api.amadeus.com |
| RAPIDAPI_KEY | Optional – hotels (Booking.com), trains (RailYatri) |
| ENABLE_CACHE | true/false |
| CACHE_TTL_SECONDS | Cache TTL (e.g. 300) |
| CORS_ORIGIN | Allowed origins (comma-separated) |
| RATE_LIMIT_WINDOW_MS | Rate limit window |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window |

See `YOUR_ENV_FILE_GUIDE.md` in the project root for step-by-step API key setup (Amadeus, RapidAPI, Google).

---

## 7. API Endpoints Summary

Base URL: `http://localhost:3000`

### Travel & discovery
- `GET /api/weather?destination=CityName` – Weather
- `GET /api/places/search/:destination` – Places search
- `GET /api/google-places/...` – Google Places
- `POST /api/flights/search` – Flights
- `POST /api/hotels/search` – Hotels
- `POST /api/trains/search` – Trains
- `POST /api/buses/search` – Buses
- `POST /api/rides/estimate` – Ride estimates
- Medical tourism route under `/api/medical`

### User & data (often require JWT)
- `POST /api/auth/register` – Register
- `POST /api/auth/login` – Login (returns JWT)
- `GET /api/auth/me` – Current user (auth)
- `GET/PUT /api/users/profile` – Profile
- `PUT /api/users/preferences` – Preferences
- `GET /api/users/stats` – User stats
- `POST/GET /api/bookings` – Bookings
- `GET /api/bookings/:id`, `PUT`, `POST .../cancel`
- `POST/GET/DELETE /api/favorites` – Favorites
- `POST/GET/DELETE /api/search-history` – Search history
- `GET /api/search-history/recent`, `popular-destinations`
- `POST/GET/PUT/DELETE /api/reviews` – Reviews
- `POST/GET/PUT/DELETE /api/trips` – Trips, itinerary, add booking/photo
- `GET /api/assistant/...` – Assistant
- `.../onedrly-ai` – Onedrly AI routes

### System
- `GET /health` – Health check
- `GET /api/metrics` – API performance metrics

Authentication: `Authorization: Bearer <JWT>`.

Full request/response examples and query parameters: see `backend/API_ENDPOINTS.md`.

---

## 8. Design (Frontend)

- Light theme with gradients (white, soft lavender, light rose)
- Accent colors: purple (#7877c6), coral (#ff6e7f), teal (#52b69a)
- Glass morphism (frosted panels, blur)
- 3D-style animations (floating, perspective, hover lift)
- Responsive layout; mobile-friendly
- Details: `NEW_DESIGN_FEATURES.md`

---

## 9. Supported Cities / Coverage

40+ major cities, including:

- Asia: Mumbai, Delhi, Tokyo, Singapore, Dubai, Bangkok
- Europe: London, Paris, Berlin, Rome, Amsterdam
- Americas: New York, Los Angeles, Toronto, Mexico City
- Oceania: Sydney, Melbourne, Auckland
- Africa: Cairo, Cape Town, Nairobi

Travel logic is distance- and mode-aware (e.g. trains only where relevant).

---

## 10. Backend Behaviour

- Caching (node-cache, TTL configurable)
- Rate limiting on `/api/`
- Security: Helmet, CORS, body size limits
- API optimizer: timeouts, circuit breaker, metrics at `/api/metrics`
- Graceful shutdown on SIGTERM
- If MongoDB is not connected, server still starts but user-related features are disabled

---

## 11. Troubleshooting

- **Backend won’t start:** Run `cd backend && npm install && node server.js`. Check `.env` and Node version.
- **Port in use:** Change `PORT` in `backend/.env` or free the port.
- **No trains/buses for a route:** By design for routes without rail/bus; only relevant modes are shown.
- **Empty results:** Ensure backend is running on 3000, frontend on 4200; check browser console and network tab.
- **User features not working:** Set `MONGODB_URI` in `backend/.env` and restart backend.

---

## 12. Documentation Files in Repo

- `README.md` – Project overview and quick start
- `HOW_TO_RUN.md` – Run instructions and tests
- `YOUR_ENV_FILE_GUIDE.md` – .env and API keys (Amadeus, RapidAPI, Google)
- `NEW_DESIGN_FEATURES.md` – UI/design system
- `backend/README.md` – Backend overview
- `backend/API_ENDPOINTS.md` – Full API reference with examples
- `PROJECT_DOCUMENTATION.md` – This document

---

## 13. License & Credits

- License: MIT
- Built with Angular, Node.js, Express, MongoDB, and various travel/weather/places APIs.
- Design: custom light theme with glass morphism and 3D-style effects.

---

**End of project documentation.** You can copy this entire file into a Word/Google Doc or any editor and export to PDF.
