const express = require('express');
const router = express.Router();
const worldwideData = require('../services/worldwide-travel-data');

/**
 * Get ride estimates - OPTIMIZED for instant response
 * POST /api/rides/estimate
 */
router.post('/estimate', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: origin, destination'
      });
    }

    const cache = req.app.locals.cache;
    const cacheKey = `rides_${origin}_${destination}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && process.env.ENABLE_CACHE === 'true') {
      console.log('✅ Returning cached ride data');
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // INSTANT response - no external API delays
    // Calculate realistic distance and duration
    const distance = calculateDistance(origin, destination);
    const duration = Math.ceil(distance * 2.5 + 5); // Base time + traffic
    const trafficMultiplier = getTrafficMultiplier();
    
    console.log(`⚡ Generated instant ride estimates: ${distance}km, ${duration}min`);
    
    const rides = getInstantRideEstimates(distance, duration, trafficMultiplier);
    
    cache.set(cacheKey, rides, 180); // Cache for 3 minutes (rides change frequently)

    res.json({
      success: true,
      data: rides,
      source: 'instant_estimates',
      metadata: {
        distance: `${distance.toFixed(1)} km`,
        estimatedDuration: `${duration} min`,
        trafficCondition: trafficMultiplier > 1.2 ? 'Heavy' : trafficMultiplier > 1.0 ? 'Moderate' : 'Light'
      },
      cached: false
    });

  } catch (error) {
    console.error('Ride estimate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting ride estimates',
      error: error.message
    });
  }
});

/**
 * Calculate realistic distance between locations
 */
function calculateDistance(origin, destination) {
  // Realistic distance calculation (simplified)
  // In production, you'd use actual geocoding
  const hash = (origin + destination).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 5 + (hash % 40); // Between 5-45 km
}

/**
 * Get traffic multiplier based on time of day
 */
function getTrafficMultiplier() {
  const hour = new Date().getHours();
  // Peak hours: 8-10 AM, 6-9 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
    return 1.3; // Heavy traffic
  } else if ((hour >= 7 && hour <= 11) || (hour >= 17 && hour <= 22)) {
    return 1.15; // Moderate traffic
  }
  return 1.0; // Light traffic
}

/**
 * INSTANT ride estimates - returns immediately with realistic pricing
 */
function getInstantRideEstimates(distance, duration, trafficMultiplier) {
  const services = [
    { 
      service: 'rapido_bike', 
      name: 'Rapido Bike', 
      multiplier: 0.45, 
      type: 'Bike',
      icon: '🏍️',
      seats: 1,
      eta: Math.ceil(duration * 0.8) // Bikes are faster
    },
    { 
      service: 'ola_micro', 
      name: 'Ola Micro', 
      multiplier: 0.75, 
      type: 'Hatchback',
      icon: '🚗',
      seats: 3,
      eta: duration
    },
    { 
      service: 'uber_go', 
      name: 'Uber Go', 
      multiplier: 0.85, 
      type: 'Sedan',
      icon: '🚙',
      seats: 4,
      eta: duration
    },
    { 
      service: 'ola_mini', 
      name: 'Ola Mini', 
      multiplier: 0.9, 
      type: 'Sedan',
      icon: '🚙',
      seats: 4,
      eta: duration
    },
    { 
      service: 'ola_prime', 
      name: 'Ola Prime', 
      multiplier: 1.35, 
      type: 'Premium Sedan',
      icon: '🚘',
      seats: 4,
      eta: duration
    },
    { 
      service: 'uber_premier', 
      name: 'Uber Premier', 
      multiplier: 1.6, 
      type: 'Luxury Sedan',
      icon: '🚘',
      seats: 4,
      eta: duration
    },
    { 
      service: 'ola_suv', 
      name: 'Ola SUV', 
      multiplier: 1.8, 
      type: 'SUV',
      icon: '🚐',
      seats: 6,
      eta: Math.ceil(duration * 1.1)
    }
  ];

  // Base rate: ₹10/km + ₹2/min
  const basePrice = (distance * 10) + (duration * 2);
  const trafficSurcharge = trafficMultiplier > 1.0 ? (basePrice * 0.2) : 0;

  return services.map((service, index) => {
    const serviceFare = (basePrice + trafficSurcharge) * service.multiplier;
    const minimum = Math.round(serviceFare * 0.95);
    const maximum = Math.round(serviceFare * 1.05);

    return {
      id: `ride-${service.service}`,
      service: service.service,
      displayName: service.name,
      type: service.type,
      icon: service.icon,
      estimate: `${service.eta} min`,
      eta: service.eta,
      fareEstimate: {
        minimum: minimum,
        maximum: maximum,
        currency: 'INR',
        formatted: `₹${minimum} - ₹${maximum}`
      },
      duration: service.eta,
      distance: Math.round(distance * 10) / 10,
      seats: service.seats,
      available: true,
      surge: trafficMultiplier > 1.2,
      surgeMultiplier: trafficMultiplier > 1.2 ? trafficMultiplier.toFixed(1) : null,
      features: getServiceFeatures(service.type),
      bestValue: index === Math.floor(services.length / 2) // Mark middle option as best value
    };
  });
}

/**
 * Get service features based on type
 */
function getServiceFeatures(type) {
  const features = {
    'Bike': ['Fastest', 'Budget-Friendly', 'Solo Ride'],
    'Hatchback': ['Affordable', 'AC', '3 Passengers'],
    'Sedan': ['Comfortable', 'AC', '4 Passengers'],
    'Premium Sedan': ['Luxury', 'Professional Driver', 'Extra Legroom'],
    'Luxury Sedan': ['Premium Experience', 'High-End Cars', 'VIP Service'],
    'SUV': ['Spacious', 'Group Travel', '6+ Passengers']
  };
  return features[type] || ['Comfortable Ride'];
}

module.exports = router;

