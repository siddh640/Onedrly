# 🌍 Onedrly - Travel Booking Platform

A modern, worldwide travel booking platform with real-time data for flights, trains, buses, hotels, and rides.

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### **2. Start the Servers**

**Backend (Terminal 1):**
```bash
cd backend
node server.js
```

**Frontend (Terminal 2):**
```bash
npm start
```

### **3. Open Your Browser**
```
http://localhost:4200
```

---

## 🌟 Features

### **Travel Booking**
- ✈️ **Flights** - Worldwide coverage, 40+ cities
- 🚂 **Trains** - India, Japan, Europe, China
- 🚌 **Buses** - Regional and intercity
- 🏨 **Hotels** - 2-5 star options globally
- 🚗 **Rides** - Uber/Ola style estimates

### **Place Discovery**
- 📍 Real place data from Google Places API
- 📸 Real photos and reviews
- 🗺️ Attractions, restaurants, shopping
- ⭐ Ratings and user reviews

### **Weather Information**
- 🌤️ Current weather conditions
- 📅 5-day forecast
- 🌡️ Temperature, humidity, wind speed

---

## 🌍 Supported Cities

**40+ major cities across:**
- 🌏 Asia: Mumbai, Delhi, Tokyo, Singapore, Dubai, Bangkok
- 🌍 Europe: London, Paris, Berlin, Rome, Amsterdam
- 🌎 Americas: New York, Los Angeles, Toronto, Mexico City
- 🌏 Oceania: Sydney, Melbourne, Auckland
- 🌍 Africa: Cairo, Cape Town, Nairobi

---

## 🔑 Optional: Add Google Places API

For 100% accurate place data with real photos and reviews:

1. Get your API key: [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Places API"
3. Add to `backend/.env`:
   ```
   GOOGLE_PLACES_API_KEY=your_key_here
   ```
4. Restart backend

**See `GOOGLE_PLACES_SETUP.md` for detailed instructions.**

---

## 📁 Project Structure

```
destination-information/
├── src/                    # Frontend (Angular)
│   ├── app/
│   │   ├── components/    # UI Components
│   │   ├── services/      # API Services
│   │   └── app.css        # Main styles
│   └── styles.css         # Global styles
│
├── backend/               # Backend (Node.js + Express)
│   ├── routes/           # API Endpoints
│   ├── services/         # Business Logic
│   │   ├── worldwide-travel-data.js  # Travel data generator
│   │   ├── google-places-service.js  # Places API
│   │   ├── flight-aggregator.js      # Flight search
│   │   ├── train-aggregator.js       # Train search
│   │   └── hotel-aggregator.js       # Hotel search
│   └── server.js         # Main server file
│
└── README.md             # This file
```

---

## 🎨 Design Features

- ✨ Modern light theme with gradient backgrounds
- 💎 Glass morphism effects
- 🎭 Smooth 3D animations
- 📱 Fully responsive design
- ⚡ Fast and optimized

**See `NEW_DESIGN_FEATURES.md` for details.**

---

## 🌐 API Endpoints

### **Backend API** (`http://localhost:3000`)

**Places:**
- `GET /api/places/search/:destination` - Search places

**Weather:**
- `GET /api/weather?destination=CityName` - Get weather

**Travel:**
- `POST /api/flights/search` - Search flights
- `POST /api/trains/search` - Search trains
- `POST /api/buses/search` - Search buses
- `POST /api/hotels/search` - Search hotels
- `POST /api/rides/estimate` - Get ride estimates

---

## 🛠️ Technologies Used

### **Frontend**
- Angular 18
- TypeScript
- RxJS
- CSS3 (Glass morphism, 3D animations)

### **Backend**
- Node.js
- Express.js
- Axios (API calls)
- Node-cache (Caching)

### **APIs**
- Google Places API (Optional)
- OpenStreetMap (Free)
- Wikipedia API (Free)
- Wikimedia Commons (Free)
- OpenWeather API (Free)

---

## 📊 How It Works

### **Worldwide Travel Data**

The platform generates realistic travel data for any city pair:

1. **Distance Calculation** - Uses GPS coordinates
2. **Mode Selection** - Chooses appropriate travel modes
3. **Price Estimation** - Distance-based pricing
4. **Timing** - Realistic schedules based on mode

**Example:**
- Mumbai → Delhi: Flights + Trains + Buses ✓
- New York → Tokyo: Flights only (realistic!) ✓
- London → Paris: Flights + Trains ✓

---

## 🔧 Configuration

### **Environment Variables**

Create `backend/.env`:

```env
# Optional - For 100% accurate place data
GOOGLE_PLACES_API_KEY=your_key_here

# Weather (Free API key included)
OPENWEATHER_API_KEY=your_key_or_use_default

# Server Settings
PORT=3000
ENABLE_CACHE=true
CACHE_TTL_SECONDS=3600
```

**See `backend/env.example` for all options.**

---

## 📚 Additional Documentation

- **`NEW_DESIGN_FEATURES.md`** - Design system documentation
- **`API_NOW_WORLDWIDE.md`** - Worldwide API capabilities
- **`GOOGLE_PLACES_SETUP.md`** - How to add Google Places API
- **`backend/FREE_API_SOURCES.md`** - Free API alternatives
- **`backend/WHY_BETTER_THAN_MAKEMYTRIP.md`** - Competitive advantages

---

## 🐛 Troubleshooting

### **"No trains found"**
- This is **correct** for routes without rail service
- Trains only show for:
  - Same country routes
  - Countries with good rail networks (India, Japan, Europe, China)

### **Empty search results**
- Make sure backend is running on port 3000
- Check browser console for errors
- Verify city name spelling

### **Can't connect to backend**
- Restart backend: `cd backend && node server.js`
- Check if port 3000 is available
- Try `http://localhost:3000/health`

---

## 🎯 Roadmap

- [ ] Add real-time flight API integration (Amadeus)
- [ ] Add booking functionality
- [ ] User authentication and profiles
- [ ] Saved searches and favorites
- [ ] Price alerts
- [ ] Multi-language support

---

## 📄 License

MIT License - Feel free to use for your projects!

---

## 🙌 Credits

Built with ❤️ using modern web technologies.

- Design: Custom light theme with glass morphism
- Data: Multiple free and premium APIs
- Icons: Unicode emojis

---

## 📧 Support

For issues or questions:
1. Check the documentation in this folder
2. Review the API setup guides
3. Test with `http://localhost:3000/health`

---

**Enjoy your worldwide travel booking platform!** ✈️🌍✨
