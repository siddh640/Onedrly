const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Booking Type
  bookingType: {
    type: String,
    enum: ['flight', 'hotel', 'train', 'bus', 'ride', 'package'],
    required: [true, 'Booking type is required']
  },
  
  // Booking Reference
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  
  // Trip Details
  tripDetails: {
    origin: {
      name: String,
      code: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    destination: {
      name: String,
      code: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    departureDate: Date,
    returnDate: Date,
    tripType: {
      type: String,
      enum: ['one-way', 'round-trip', 'multi-city'],
      default: 'one-way'
    }
  },
  
  // Travelers
  travelers: [{
    type: {
      type: String,
      enum: ['adult', 'child', 'infant'],
      default: 'adult'
    },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    passportNumber: String,
    nationality: String
  }],
  
  // Flight Specific (if bookingType is 'flight')
  flightDetails: {
    airline: String,
    flightNumber: String,
    cabin: {
      type: String,
      enum: ['economy', 'premium-economy', 'business', 'first'],
      default: 'economy'
    },
    stops: Number,
    duration: String,
    baggage: {
      checkedIn: String,
      cabin: String
    }
  },
  
  // Hotel Specific (if bookingType is 'hotel')
  hotelDetails: {
    hotelName: String,
    hotelAddress: String,
    checkInDate: Date,
    checkOutDate: Date,
    nights: Number,
    roomType: String,
    numberOfRooms: Number,
    guests: Number,
    amenities: [String]
  },
  
  // Train/Bus Specific
  transportDetails: {
    operatorName: String,
    vehicleNumber: String,
    class: String,
    seatNumbers: [String],
    departureTime: String,
    arrivalTime: String
  },
  
  // Ride Specific
  rideDetails: {
    provider: String,
    vehicleType: String,
    pickupLocation: String,
    dropoffLocation: String,
    pickupTime: Date
  },
  
  // Pricing
  pricing: {
    baseFare: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Payment Details
  payment: {
    method: {
      type: String,
      enum: ['credit-card', 'debit-card', 'paypal', 'upi', 'net-banking', 'wallet'],
      required: true
    },
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  
  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Cancellation
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date,
    cancellationReason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['not-applicable', 'pending', 'processed', 'completed']
    }
  },
  
  // Additional Info
  specialRequests: String,
  notes: String,
  
  // Confirmation emails/messages sent
  notificationsSent: {
    confirmation: { type: Boolean, default: false },
    reminder: { type: Boolean, default: false },
    completion: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ createdAt: -1 });

// Generate unique booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const prefix = this.bookingType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `${prefix}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

