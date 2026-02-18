const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Favorite Type
  favoriteType: {
    type: String,
    enum: ['destination', 'hotel', 'place', 'attraction', 'restaurant', 'flight-route'],
    required: true
  },
  
  // Item Details
  itemDetails: {
    // Unique identifier from external API
    externalId: String,
    
    // Basic Info
    name: {
      type: String,
      required: true
    },
    description: String,
    imageUrl: String,
    
    // Location
    location: {
      city: String,
      country: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    // Rating
    rating: {
      value: Number,
      count: Number
    },
    
    // Price indicator
    priceLevel: {
      type: String,
      enum: ['budget', 'moderate', 'expensive', 'luxury']
    },
    
    // Additional metadata
    category: [String],
    tags: [String],
    
    // For flight routes
    route: {
      origin: String,
      destination: String,
      originCode: String,
      destinationCode: String
    }
  },
  
  // User Notes
  userNotes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Custom tags by user
  userTags: [String],
  
  // Trip Planning
  addedToTrip: {
    type: Boolean,
    default: false
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  
  // Visit status
  visited: {
    type: Boolean,
    default: false
  },
  visitedDate: Date,
  
  // Priority/Wishlist ranking
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  // Saved at
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
favoriteSchema.index({ userId: 1, favoriteType: 1 });
favoriteSchema.index({ 'itemDetails.externalId': 1 });
favoriteSchema.index({ savedAt: -1 });

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, 'itemDetails.externalId': 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

