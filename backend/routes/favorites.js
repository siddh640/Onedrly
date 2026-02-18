const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { protect } = require('../middleware/auth');

// @route   POST /api/favorites
// @desc    Add item to favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const favoriteData = {
      ...req.body,
      userId: req.user.id
    };

    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.user.id,
      'itemDetails.externalId': req.body.itemDetails.externalId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites'
      });
    }

    const favorite = await Favorite.create(favoriteData);

    res.status(201).json({
      success: true,
      message: 'Added to favorites successfully',
      data: {
        favorite
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message
    });
  }
});

// @route   GET /api/favorites
// @desc    Get all user favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, sort = '-savedAt', limit = 50 } = req.query;

    const query = { userId: req.user.id };
    
    if (type) {
      query.favoriteType = type;
    }

    const favorites = await Favorite.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: {
        favorites
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// @route   GET /api/favorites/:id
// @desc    Get single favorite
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        favorite
      }
    });
  } catch (error) {
    console.error('Get favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorite',
      error: error.message
    });
  }
});

// @route   PUT /api/favorites/:id
// @desc    Update favorite (notes, tags, priority)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Update allowed fields
    const { userNotes, userTags, priority, visited, visitedDate } = req.body;
    
    if (userNotes !== undefined) favorite.userNotes = userNotes;
    if (userTags !== undefined) favorite.userTags = userTags;
    if (priority !== undefined) favorite.priority = priority;
    if (visited !== undefined) favorite.visited = visited;
    if (visitedDate !== undefined) favorite.visitedDate = visitedDate;

    await favorite.save();

    res.status(200).json({
      success: true,
      message: 'Favorite updated successfully',
      data: {
        favorite
      }
    });
  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorite',
      error: error.message
    });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Remove from favorites
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message
    });
  }
});

// @route   POST /api/favorites/check
// @desc    Check if item is favorited
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const { externalId } = req.body;

    const favorite = await Favorite.findOne({
      userId: req.user.id,
      'itemDetails.externalId': externalId
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite ? favorite._id : null
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status',
      error: error.message
    });
  }
});

module.exports = router;

