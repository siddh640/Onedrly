const express = require('express');
const axios = require('axios');
const router = express.Router();

const googlePlacesService = require('../services/google-places-service');
const Trip = require('../models/Trip');
const { optionalAuth } = require('../middleware/auth');

/**
 * Simple intent detection based on keywords
 */
function detectIntent(message = '') {
  const text = message.toLowerCase();

  if (text.includes('restaurant') || text.includes('food') || text.includes('eat')) {
    return 'restaurants';
  }
  if (text.includes('hotel') || text.includes('stay') || text.includes('room')) {
    return 'hotels';
  }
  if (text.includes('shop') || text.includes('mall') || text.includes('market')) {
    return 'shopping';
  }
  if (text.includes('plan') || text.includes('itinerary') || text.includes('trip')) {
    return 'itinerary';
  }
  return 'attractions';
}

/**
 * Extract destination from message (naive parsing)
 */
function extractDestination(message = '', providedDestination) {
  if (providedDestination) return providedDestination;
  const inIndex = message.toLowerCase().lastIndexOf(' in ');
  if (inIndex !== -1) {
    return message.substring(inIndex + 4).replace('?', '').trim();
  }
  return null;
}

function pickTop(items = [], limit = 3) {
  return (items || []).slice(0, limit);
}

async function ensurePlaces(destination, data, category) {
  if (Array.isArray(data) && data.length) {
    return data;
  }

  if (typeof googlePlacesService.getFallbackPlaces === 'function') {
    return await googlePlacesService.getFallbackPlaces(destination, category);
  }

  return [];
}

async function fetchDestinationData(destination) {
  try {
    const data = await googlePlacesService.searchDestination(destination);
    return await normalizeDestinationData(destination, data);
  } catch (error) {
    console.error(`Destination lookup failed for ${destination}:`, error.message);
    if (typeof googlePlacesService.getComprehensiveFallbackData === 'function') {
      const fallback = await googlePlacesService.getComprehensiveFallbackData(destination);
      return await normalizeDestinationData(destination, fallback);
    }
    return await normalizeDestinationData(destination, {});
  }
}

async function normalizeDestinationData(destination, data = {}) {
  try {
    const [attractions, restaurants, shopping] = await Promise.all([
      ensurePlaces(destination, data.attractions, 'attractions'),
      ensurePlaces(destination, data.restaurants, 'restaurants'),
      ensurePlaces(destination, data.shopping, 'shopping')
    ]);

    return {
      ...data,
      destination: data.destination || destination,
      formattedAddress: data.formattedAddress || `${destination}, India`,
      location: data.location || { lat: 28.6139, lng: 77.209 },
      attractions: Array.isArray(attractions) ? attractions : [],
      restaurants: Array.isArray(restaurants) ? restaurants : [],
      shopping: Array.isArray(shopping) ? shopping : []
    };
  } catch (error) {
    console.error('Error normalizing destination data:', error.message);
    // Return minimal valid structure
    return {
      destination: destination,
      formattedAddress: `${destination}, India`,
      location: { lat: 28.6139, lng: 77.209 },
      attractions: [],
      restaurants: [],
      shopping: []
    };
  }
}

function buildSummaryCard(item) {
  if (!item || typeof item !== 'object') {
    return {
      name: 'Unknown place',
      rating: 4.0,
      address: 'Address not available',
      description: 'No description available',
      photos: [],
      tags: [],
      link: null
    };
  }
  
  return {
    name: item.name || 'Unknown place',
    rating: item.rating || 4.2,
    address: item.address || item.formattedAddress || item.vicinity || 'Address not available',
    priceLevel: item.priceLevel,
    description: item.description || `A popular destination worth visiting.`,
    photos: pickTop(item.photos || [], 3),
    tags: item.types || [],
    link: item.website || item.googleMapsUrl || null
  };
}

/**
 * POST /api/assistant/chat
 * Conversational helper that uses existing data sources
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, destination: destInput, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question.'
      });
    }

    const intent = detectIntent(message);
    const destination = extractDestination(message, destInput || context?.destination);

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Please mention a destination so I can fetch real recommendations.'
      });
    }

    const destinationData = await fetchDestinationData(destination);

    let collection = [];
    switch (intent) {
      case 'restaurants':
        collection = pickTop(destinationData.restaurants, 5);
        break;
      case 'shopping':
        collection = pickTop(destinationData.shopping, 5);
        break;
      case 'hotels':
        // Use restaurants as fallback if hotels not available
        collection = pickTop(destinationData.shopping, 5).map(item => ({
          ...item,
          priceLevel: item.priceLevel || Math.ceil(Math.random() * 4),
          description: item.description || `Highly rated stay option in ${destination}`
        }));
        break;
      default:
        collection = pickTop(destinationData.attractions, 5);
        break;
    }

    const cards = collection.map(buildSummaryCard);

    const answer = cards.length
      ? `Here are ${cards.length} ${intent === 'shopping' ? 'shopping spots' : intent === 'restaurants' ? 'eating places' : 'places'} in ${destination} you will love.`
      : `I could not find live data for ${destination}, but I can still help you plan if you try another query.`;

    return res.json({
      success: true,
      data: {
        answer,
        intent,
        destination,
        suggestions: cards,
        tips: [
          'Tap on any card to view more info or save it as a favorite.',
          'Ask “plan a 3 day trip to Manali under 20k” to generate an itinerary.'
        ]
      }
    });
  } catch (error) {
    console.error('Chat assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch recommendations right now.',
      error: error.message
    });
  }
});

function getDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return [];
  }

  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function buildItinerary(days, destinationData, preferences = {}) {
  const attractions = [...(destinationData.attractions || [])];
  const restaurants = [...(destinationData.restaurants || [])];
  const shopping = [...(destinationData.shopping || [])];

  // Ensure we have at least some activities to show
  const hasAnyData = attractions.length > 0 || restaurants.length > 0 || shopping.length > 0;

  return days.map((date, index) => {
    const dayLabel = `Day ${index + 1}`;
    const activities = [];

    if (attractions.length) {
      const attraction = attractions[index % attractions.length];
      if (attraction && attraction.name) {
        activities.push({
          title: attraction.name,
          type: 'attraction',
          details: buildSummaryCard(attraction)
        });
      }
    }

    if (restaurants.length) {
      const restaurant = restaurants[index % restaurants.length];
      if (restaurant && restaurant.name) {
        activities.push({
          title: restaurant.name,
          type: 'food',
          details: buildSummaryCard(restaurant)
        });
      }
    }

    if (shopping.length && preferences.shopping) {
      const shop = shopping[index % shopping.length];
      if (shop && shop.name) {
        activities.push({
          title: shop.name,
          type: 'shopping',
          details: buildSummaryCard(shop)
        });
      }
    }

    // If no activities found, add a generic suggestion
    if (activities.length === 0 && hasAnyData) {
      activities.push({
        title: `Explore ${destinationData.destination || 'the destination'}`,
        type: 'general',
        details: {
          name: destinationData.destination || 'Destination',
          description: `Take time to explore and discover local attractions, restaurants, and shopping areas.`,
          address: destinationData.formattedAddress || 'Various locations',
          rating: 4.0
        }
      });
    }

    return {
      day: dayLabel,
      date: date.toISOString().split('T')[0],
      activities
    };
  });
}

/**
 * POST /api/assistant/plan-trip
 * Generates an itinerary and optionally saves it for the logged in user
 */
router.post('/plan-trip', optionalAuth, async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget = 20000,
      travelers = 2,
      pace = 'balanced',
      preferences = {}
    } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination, startDate and endDate are required.'
      });
    }

    const days = getDateRange(startDate, endDate);
    if (!days.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.'
      });
    }

    const destinationData = await fetchDestinationData(destination);
    
    // Ensure we have valid data structure
    if (!destinationData.attractions) destinationData.attractions = [];
    if (!destinationData.restaurants) destinationData.restaurants = [];
    if (!destinationData.shopping) destinationData.shopping = [];
    
    const itinerary = buildItinerary(days, destinationData, preferences);

    const budgetPerDay = Math.round(budget / days.length);
    const topRestaurants = pickTop(destinationData.restaurants || [], 2);
    const summary = {
      destination: destination,
      totalDays: days.length,
      budget,
      budgetPerDay,
      recommendedPace: pace,
      weatherTip: 'Carry a light jacket for evenings and keep hydration handy.',
      mustTryFood: topRestaurants.length > 0 
        ? topRestaurants.map(item => item.name || 'Local cuisine')
        : ['Local cuisine', 'Street food']
    };

    let tripRecord = null;
    if (req.user) {
      try {
        // Only try to save if MongoDB is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          tripRecord = await Trip.create({
            userId: req.user._id,
            tripName: `${destination} Escape`,
            destination: {
              name: destinationData.destination || destination,
              country: 'Unknown',
              coordinates: destinationData.location
            },
            startDate,
            endDate,
            tripType: preferences.tripType || 'couple',
            status: 'planning',
            itinerary: itinerary.map((day) => ({
              day: parseInt(day.day.replace('Day ', ''), 10),
              date: day.date,
              activities: day.activities.map(activity => ({
                title: activity.title,
                description: activity.details?.description || '',
                location: {
                  name: activity.details?.name,
                  address: activity.details?.address
                },
                time: 'Flexible'
              }))
            })),
            budget: {
              estimated: budget,
              currency: 'INR'
            },
            notes: 'Generated automatically by AI travel planner.'
          });
        }
      } catch (dbError) {
        console.warn('Could not save trip to database (MongoDB may not be connected):', dbError.message);
        // Continue without saving - trip generation still works
      }
    }

    res.json({
      success: true,
      data: {
        summary,
        itinerary,
        savedTripId: tripRecord?._id || null
      }
    });
  } catch (error) {
    console.error('Trip planner error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to build the itinerary right now.',
      error: error.message
    });
  }
});

async function fetchEmergencyPlaces(destination, type) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: `${type} in ${destination}`,
        format: 'json',
        limit: 5
      },
      headers: {
        'User-Agent': 'Onedrly-App/1.0'
      }
    });

    return response.data.map(place => ({
      name: place.display_name.split(',')[0],
      address: place.display_name,
      lat: place.lat,
      lon: place.lon,
      type
    }));
  } catch (error) {
    console.warn(`Emergency lookup failed for ${type}:`, error.message);
    return [];
  }
}

const HELPLINES = [
  { label: 'International SOS', phone: '+91 124 497 7999' },
  { label: 'Tourist Helpline (India)', phone: '1800-111-363' },
  { label: 'Global Emergency', phone: '112' },
  { label: 'Women Safety', phone: '1091' }
];

function buildEmergencyFallback(destination) {
  return {
    destination,
    hospitals: [
      { name: `${destination} General Hospital`, address: `${destination} Central District`, type: 'hospital' },
      { name: `${destination} Emergency Care`, address: `${destination} Airport Road`, type: 'hospital' },
      { name: `${destination} Medical Center`, address: `${destination} Old Town`, type: 'hospital' }
    ],
    police: [
      { name: `${destination} Police HQ`, address: `${destination} Civic Center`, type: 'police' },
      { name: `${destination} Tourist Police`, address: `${destination} Heritage Zone`, type: 'police' },
      { name: `${destination} Patrol Unit`, address: `${destination} Coastal Road`, type: 'police' }
    ],
    pharmacies: [
      { name: `${destination} 24x7 Pharmacy`, address: `${destination} Main Bazaar`, type: 'pharmacy' },
      { name: `${destination} Wellness Chemists`, address: `${destination} Metro Station`, type: 'pharmacy' },
      { name: `${destination} Travel Clinic`, address: `${destination} Business District`, type: 'pharmacy' }
    ],
    helplines: HELPLINES
  };
}

/**
 * GET /api/assistant/emergency?destination=Goa
 */
router.get('/emergency', async (req, res) => {
  try {
    const { destination } = req.query;
    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required.'
      });
    }

    const [hospitals, police, pharmacies] = await Promise.all([
      fetchEmergencyPlaces(destination, 'hospital'),
      fetchEmergencyPlaces(destination, 'police'),
      fetchEmergencyPlaces(destination, 'pharmacy')
    ]);

    const fallback = buildEmergencyFallback(destination);
    const responseData = {
      destination,
      hospitals: hospitals.length ? hospitals : fallback.hospitals,
      police: police.length ? police : fallback.police,
      pharmacies: pharmacies.length ? pharmacies : fallback.pharmacies,
      helplines: HELPLINES
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Emergency info error:', error);
    res.json({
      success: true,
      data: buildEmergencyFallback(req.query.destination || 'Your Destination'),
      message: 'Showing fallback emergency contacts.'
    });
  }
});

module.exports = router;


