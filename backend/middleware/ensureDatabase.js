const mongoose = require('mongoose');

module.exports = function ensureDatabase(req, res, next) {
  // 1 === connected
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const state = mongoose.connection.readyState;
  const stateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`⛔ MongoDB not connected. Current state: ${stateNames[state]} (${state})`);
  }

  let errorMessage = 'Unable to reach the Onedrly API. Make sure the backend server is running and MongoDB is connected.';
  
  if (state === 0) {
    errorMessage = 'MongoDB is not connected. Please configure MONGODB_URI in .env file or start local MongoDB.';
  } else if (state === 2) {
    errorMessage = 'MongoDB is connecting. Please wait a moment and try again.';
  }

  return res.status(503).json({
    success: false,
    message: errorMessage,
    error: {
      type: 'DatabaseConnectionError',
      state: stateNames[state],
      details: 'MongoDB connection is required for this operation. Please check your database configuration.'
    }
  });
};


