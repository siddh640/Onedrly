const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

// MongoDB connection
const connectDB = require('./config/database');
const onedrlyAiRouter = require('./routes/onedrly-ai');

const app = express();

// Connect to MongoDB before starting server
let dbConnected = false;

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
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Root – so opening http://localhost:3000 in browser shows something
app.get('/', (req, res) => {
  const port = process.env.PORT || 3000;
  res.type('html').status(200).send(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Onedrly API</title></head>
    <body style="font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem;">
      <h1>Onedrly Backend API</h1>
      <p>API is running. Use these links:</p>
      <ul>
        <li><a href="/health">/health</a> – health check (JSON)</li>
        <li><a href="/api/metrics">/api/metrics</a> – API metrics</li>
      </ul>
      <p>Frontend should use: <strong>http://localhost:${port}/api</strong> (or http://127.0.0.1:${port}/api)</p>
    </body></html>
  `);
});

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
app.use('/api/medical', require('./routes/medical-tourism'));
app.use('/api/rides', require('./routes/rides'));

// User & Data Management routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/search-history', require('./routes/search-history'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/onedrly-ai', onedrlyAiRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      travel: [
        '/api/weather',
        '/api/places',
        '/api/flights',
        '/api/hotels',
        '/api/trains',
        '/api/buses',
        '/api/rides'
      ],
      userManagement: [
        '/api/auth/register',
        '/api/auth/login',
        '/api/users/profile',
        '/api/users/preferences'
      ],
      dataManagement: [
        '/api/bookings',
        '/api/favorites',
        '/api/search-history',
        '/api/reviews',
        '/api/trips'
      ]
    }
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

// Start server after MongoDB connection
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const connection = await connectDB();
    
    if (connection) {
      dbConnected = true;
      console.log('✅ MongoDB connection established');
    } else {
      console.warn('⚠️  MongoDB connection failed, but server will start anyway');
      console.warn('⚠️  User management features will not work without MongoDB');
      console.warn('💡 To fix: Set MONGODB_URI in .env file or start local MongoDB');
    }

    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 ONEDRLY BACKEND API - OPTIMIZED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`⚡ API Metrics:  http://localhost:${PORT}/api/metrics`);
      if (dbConnected) {
        console.log('🗄️  MongoDB: Connected');
      } else {
        console.log('🗄️  MongoDB: Not Connected (User features disabled)');
      }
      console.log('');
      console.log('📡 Travel APIs:');
      console.log(`   ✅ Weather:  http://localhost:${PORT}/api/weather`);
      console.log(`   ✅ Places:   http://localhost:${PORT}/api/places`);
      console.log(`   ✅ Flights:  http://localhost:${PORT}/api/flights`);
      console.log(`   ✅ Hotels:   http://localhost:${PORT}/api/hotels`);
      console.log(`   ✅ Trains:   http://localhost:${PORT}/api/trains`);
      console.log(`   ✅ Buses:    http://localhost:${PORT}/api/buses`);
      console.log(`   ✅ Rides:    http://localhost:${PORT}/api/rides`);
      console.log('');
      console.log('👤 User Management APIs:');
      console.log(`   ✅ Auth:        http://localhost:${PORT}/api/auth`);
      console.log(`   ✅ Profile:     http://localhost:${PORT}/api/users`);
      console.log(`   ✅ Bookings:    http://localhost:${PORT}/api/bookings`);
      console.log(`   ✅ Favorites:   http://localhost:${PORT}/api/favorites`);
      console.log(`   ✅ Search:      http://localhost:${PORT}/api/search-history`);
      console.log(`   ✅ Reviews:     http://localhost:${PORT}/api/reviews`);
      console.log(`   ✅ Trips:       http://localhost:${PORT}/api/trips`);
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
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;

