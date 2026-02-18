const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');
const { protect } = require('../middleware/auth');

// @route   POST /api/search-history
// @desc    Save search history
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const searchData = {
      ...req.body,
      userId: req.user.id,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform']
      }
    };

    const search = await SearchHistory.create(searchData);

    res.status(201).json({
      success: true,
      message: 'Search saved successfully',
      data: {
        search
      }
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving search',
      error: error.message
    });
  }
});

// @route   GET /api/search-history
// @desc    Get user search history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user.id };
    
    if (type) {
      query.searchType = type;
    }

    const searches = await SearchHistory.find(query)
      .sort({ searchedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await SearchHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: searches.length,
      total,
      data: {
        searches
      }
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching search history',
      error: error.message
    });
  }
});

// @route   GET /api/search-history/recent
// @desc    Get recent searches (last 10)
// @access  Private
router.get('/recent', protect, async (req, res) => {
  try {
    const searches = await SearchHistory.find({ userId: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(10)
      .select('searchType searchParams searchedAt');

    res.status(200).json({
      success: true,
      count: searches.length,
      data: {
        searches
      }
    });
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent searches',
      error: error.message
    });
  }
});

// @route   GET /api/search-history/popular-destinations
// @desc    Get user's most searched destinations
// @access  Private
router.get('/popular-destinations', protect, async (req, res) => {
  try {
    const popularDestinations = await SearchHistory.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: '$searchParams.destination.name',
        count: { $sum: 1 },
        lastSearched: { $max: '$searchedAt' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        destinations: popularDestinations
      }
    });
  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular destinations',
      error: error.message
    });
  }
});

// @route   DELETE /api/search-history/:id
// @desc    Delete specific search
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const search = await SearchHistory.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found'
      });
    }

    await search.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Search deleted successfully'
    });
  } catch (error) {
    console.error('Delete search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting search',
      error: error.message
    });
  }
});

// @route   DELETE /api/search-history
// @desc    Clear all search history
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await SearchHistory.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing search history',
      error: error.message
    });
  }
});

module.exports = router;

