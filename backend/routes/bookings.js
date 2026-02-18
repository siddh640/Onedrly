const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      userId: req.user.id
    };

    const booking = await Booking.create(bookingData);

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalBookings: 1,
        totalSpent: booking.pricing.totalAmount
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all user bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, sort = '-createdAt', limit = 20, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user.id };
    
    if (status) {
      query.bookingStatus = status;
    }
    
    if (type) {
      query.bookingType = type;
    }

    // Execute query with pagination
    const bookings = await Booking.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['specialRequests', 'notes'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        booking[key] = req.body[key];
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledAt: Date.now(),
      cancellationReason: req.body.reason || 'User requested cancellation',
      refundAmount: req.body.refundAmount || 0,
      refundStatus: 'pending'
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/upcoming
// @desc    Get upcoming bookings
// @access  Private
router.get('/filter/upcoming', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      'tripDetails.departureDate': { $gte: new Date() }
    })
      .sort({ 'tripDetails.departureDate': 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bookings',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/past
// @desc    Get past bookings
// @access  Private
router.get('/filter/past', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      bookingStatus: 'completed',
      'tripDetails.departureDate': { $lt: new Date() }
    })
      .sort({ 'tripDetails.departureDate': -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Get past bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past bookings',
      error: error.message
    });
  }
});

module.exports = router;

