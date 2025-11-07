const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();

// Initialize cache (5 minute TTL by default)
const cache = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 300,
  checkperiod: 60 
});

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4200'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Make cache available to routes
app.locals.cache = cache;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Onedrly Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cache: {
      enabled: process.env.ENABLE_CACHE === 'true',
      keys: cache.keys().length,
      stats: cache.getStats()
    }
  });
});

// API Performance Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const apiOptimizer = require('./services/api-optimizer');
  res.status(200).json({
    success: true,
    message: 'API Performance Metrics',
    timestamp: new Date().toISOString(),
    metrics: apiOptimizer.getMetrics(),
    info: {
      description: 'Real-time API performance tracking',
      metrics: {
        successRate: 'Percentage of successful API calls',
        avgDuration: 'Average response time in milliseconds',
        circuitBreakerState: 'closed = working, open = temporarily disabled, half-open = testing'
      }
    }
  });
});

// API routes
app.use('/api/weather', require('./routes/weather'));
app.use('/api/places', require('./routes/places'));
app.use('/api/google-places', require('./routes/google-places'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/trains', require('./routes/trains'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/rides', require('./routes/rides'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/weather',
      '/api/places',
      '/api/flights',
      '/api/hotels',
      '/api/trains',
      '/api/buses',
      '/api/rides'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 ONEDRLY BACKEND API - OPTIMIZED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ API Metrics:  http://localhost:${PORT}/api/metrics`);
  console.log('');
  console.log('📡 Available APIs:');
  console.log(`   ✅ Weather:  http://localhost:${PORT}/api/weather`);
  console.log(`   ✅ Places:   http://localhost:${PORT}/api/places`);
  console.log(`   ✅ Flights:  http://localhost:${PORT}/api/flights`);
  console.log(`   ✅ Hotels:   http://localhost:${PORT}/api/hotels`);
  console.log(`   ✅ Trains:   http://localhost:${PORT}/api/trains`);
  console.log(`   ✅ Buses:    http://localhost:${PORT}/api/buses`);
  console.log(`   ✅ Rides:    http://localhost:${PORT}/api/rides`);
  console.log('');
  console.log('⚡ Performance Optimizations:');
  console.log('   ✅ API timeouts: 5s (prevents slow APIs blocking)');
  console.log('   ✅ Circuit breaker: Active (auto-disables failing APIs)');
  console.log('   ✅ Priority execution: Fast APIs called first');
  console.log('   ✅ Request debouncing: Frontend optimized');
  console.log('');
  console.log('💡 Cache enabled:', process.env.ENABLE_CACHE === 'true');
  console.log('🔒 Rate limiting: Active');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});

module.exports = app;

