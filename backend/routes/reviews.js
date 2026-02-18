const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      userId: req.user.id,
      // Mark as verified if linked to a booking
      isVerified: !!req.body.bookingId
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// @route   GET /api/reviews
// @desc    Get user's reviews
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status = 'approved', sort = '-createdAt' } = req.query;

    const query = { userId: req.user.id };
    
    if (type) {
      query.reviewType = type;
    }
    
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .sort(sort)
      .populate('bookingId', 'bookingReference bookingType');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/item/:externalId
// @desc    Get reviews for a specific item
// @access  Public
router.get('/item/:externalId', async (req, res) => {
  try {
    const reviews = await Review.find({
      'itemDetails.externalId': req.params.externalId,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'profile.firstName profile.lastName profile.profilePicture')
      .limit(50);

    // Calculate average ratings
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: avgRating.toFixed(1),
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error('Get item reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'profile.firstName profile.lastName profile.profilePicture')
      .populate('bookingId', 'bookingReference bookingType');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'content', 'rating', 'pros', 'cons', 'photos'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    // Reset status to pending after edit
    review.status = 'pending';

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reacted
    const existingReaction = review.reactions.find(
      r => r.userId.toString() === req.user.id.toString()
    );

    if (existingReaction) {
      // Update existing reaction
      if (existingReaction.reaction === 'helpful') {
        return res.status(400).json({
          success: false,
          message: 'You already marked this review as helpful'
        });
      }
      
      // Change from not-helpful to helpful
      review.notHelpfulCount = Math.max(0, review.notHelpfulCount - 1);
      review.helpfulCount += 1;
      existingReaction.reaction = 'helpful';
      existingReaction.reactedAt = Date.now();
    } else {
      // Add new reaction
      review.helpfulCount += 1;
      review.reactions.push({
        userId: req.user.id,
        reaction: 'helpful',
        reactedAt: Date.now()
      });
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: {
        helpfulCount: review.helpfulCount,
        notHelpfulCount: review.notHelpfulCount
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
});

module.exports = router;

