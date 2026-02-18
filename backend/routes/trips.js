const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      userId: req.user.id,
      members: [{
        userId: req.user.id,
        name: req.user.profile.fullName,
        email: req.user.email,
        role: 'organizer',
        joinedAt: Date.now()
      }]
    };

    const trip = await Trip.create(tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip',
      error: error.message
    });
  }
});

// @route   GET /api/trips
// @desc    Get all user trips
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, sort = '-startDate' } = req.query;

    const query = { userId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .sort(sort)
      .populate('bookings.bookingId', 'bookingReference bookingType pricing');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: {
        trips
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: error.message
    });
  }
});

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('bookings.bookingId');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip',
      error: error.message
    });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Update fields
    const allowedFields = [
      'tripName', 'destination', 'startDate', 'endDate', 
      'status', 'tripType', 'budget', 'itinerary', 
      'placesToVisit', 'documents', 'packingList', 
      'notes', 'coverImage', 'isPublic'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip',
      error: error.message
    });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip',
      error: error.message
    });
  }
});

// @route   POST /api/trips/:id/add-booking
// @desc    Add booking to trip
// @access  Private
router.post('/:id/add-booking', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const { bookingId, bookingType, bookingReference, amount } = req.body;

    trip.bookings.push({
      bookingId,
      bookingType,
      bookingReference,
      amount
    });

    // Update budget
    trip.budget.actual += amount || 0;

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Booking added to trip',
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Add booking to trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding booking to trip',
      error: error.message
    });
  }
});

// @route   POST /api/trips/:id/add-photo
// @desc    Add photo to trip
// @access  Private
router.post('/:id/add-photo', protect, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const { url, caption } = req.body;

    trip.photos.push({
      url,
      caption: caption || '',
      uploadedAt: Date.now()
    });

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Photo added to trip',
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Add photo to trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding photo to trip',
      error: error.message
    });
  }
});

// @route   GET /api/trips/upcoming
// @desc    Get upcoming trips
// @access  Private
router.get('/filter/upcoming', protect, async (req, res) => {
  try {
    const trips = await Trip.find({
      userId: req.user.id,
      status: { $in: ['planning', 'booked'] },
      startDate: { $gte: new Date() }
    })
      .sort({ startDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: trips.length,
      data: {
        trips
      }
    });
  } catch (error) {
    console.error('Get upcoming trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming trips',
      error: error.message
    });
  }
});

module.exports = router;

