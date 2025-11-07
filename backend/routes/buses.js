const express = require('express');
const router = express.Router();
const worldwideData = require('../services/worldwide-travel-data');

/**
 * Search buses
 * POST /api/buses/search
 */
router.post('/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, passengers = 1 } = req.body;
    
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const cache = req.app.locals.cache;
    const cacheKey = `buses_${origin}_${destination}_${departureDate}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && process.env.ENABLE_CACHE === 'true') {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Generate WORLDWIDE bus data
    const buses = worldwideData.generateBuses(origin, destination, departureDate);
    
    // Fallback to enhanced mock if no buses found
    const finalBuses = buses.length > 0 ? buses : getEnhancedMockBuses(origin, destination, departureDate, passengers);
    cache.set(cacheKey, finalBuses);

    res.json({
      success: true,
      data: finalBuses,
      source: finalBuses.length > 0 ? 'worldwide_generator' : 'enhanced_mock',
      cached: false
    });

  } catch (error) {
    console.error('Bus search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching buses',
      error: error.message
    });
  }
});

/**
 * Enhanced mock buses with realistic operators
 */
function getEnhancedMockBuses(origin, destination, departureDate, passengers) {
  const operators = [
    { name: 'VRL Travels', type: 'AC Sleeper', basePrice: 1200, amenities: ['WiFi', 'AC', 'Charging', 'Water', 'Blanket', 'Pillow'] },
    { name: 'SRS Travels', type: 'Multi-Axle Volvo', basePrice: 1400, amenities: ['WiFi', 'AC', 'Charging', 'Water', 'Snacks', 'Entertainment'] },
    { name: 'Orange Travels', type: 'AC Seater', basePrice: 900, amenities: ['AC', 'Charging', 'Water'] },
    { name: 'KPN Travels', type: 'AC Sleeper', basePrice: 1100, amenities: ['WiFi', 'AC', 'Charging', 'Water', 'Blanket'] },
    { name: 'Parveen Travels', type: 'Semi Sleeper', basePrice: 800, amenities: ['AC', 'Water', 'Charging'] },
    { name: 'IntrCity SmartBus', type: 'AC Seater', basePrice: 1000, amenities: ['WiFi', 'AC', 'Charging', 'Water', 'Entertainment'] }
  ];

  return operators.map((operator, index) => {
    const departTime = new Date(departureDate);
    departTime.setHours(19 + index, Math.floor(Math.random() * 60), 0);
    
    const duration = 6 + index * 1.5;
    const arrivalTime = new Date(departTime);
    arrivalTime.setHours(arrivalTime.getHours() + duration);

    return {
      id: `bus-${index + 1}`,
      operator: operator.name,
      busNumber: `BUS${1000 + index * 100}`,
      origin: origin,
      destination: destination,
      departureTime: departTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
      price: operator.basePrice,
      currency: 'INR',
      available: true,
      busType: operator.type,
      seatsAvailable: 15 + Math.floor(Math.random() * 25),
      amenities: operator.amenities
    };
  });
}

module.exports = router;

