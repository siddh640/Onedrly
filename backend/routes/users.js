const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      bio,
      nationality,
      passportNumber,
      profilePicture
    } = req.body;

    const user = await User.findById(req.user.id);

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (phoneNumber !== undefined) user.profile.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.profile.gender = gender;
    if (bio !== undefined) user.profile.bio = bio;
    if (nationality !== undefined) user.profile.nationality = nationality;
    if (passportNumber !== undefined) user.profile.passportNumber = passportNumber;
    if (profilePicture !== undefined) user.profile.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const {
      currency,
      language,
      notifications,
      travelPreferences
    } = req.body;

    const user = await User.findById(req.user.id);

    // Update preferences
    if (currency !== undefined) user.preferences.currency = currency;
    if (language !== undefined) user.preferences.language = language;
    if (notifications !== undefined) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }
    if (travelPreferences !== undefined) {
      user.preferences.travelPreferences = {
        ...user.preferences.travelPreferences,
        ...travelPreferences
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const Booking = require('../models/Booking');
    const SearchHistory = require('../models/SearchHistory');
    const Favorite = require('../models/Favorite');
    const Review = require('../models/Review');
    const Trip = require('../models/Trip');

    // Get counts
    const bookingsCount = await Booking.countDocuments({ userId: user._id });
    const searchesCount = await SearchHistory.countDocuments({ userId: user._id });
    const favoritesCount = await Favorite.countDocuments({ userId: user._id });
    const reviewsCount = await Review.countDocuments({ userId: user._id });
    const tripsCount = await Trip.countDocuments({ userId: user._id });

    // Get recent bookings
    const recentBookings = await Booking.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate total spent from bookings
    const completedBookings = await Booking.find({
      userId: user._id,
      bookingStatus: 'completed'
    });
    
    const totalSpent = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pricing.totalAmount || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBookings: bookingsCount,
          totalSearches: searchesCount,
          totalFavorites: favoritesCount,
          totalReviews: reviewsCount,
          totalTrips: tripsCount,
          totalSpent: totalSpent,
          memberSince: user.memberSince,
          lastLogin: user.lastLogin
        },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

