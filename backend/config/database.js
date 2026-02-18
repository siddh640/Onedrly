const mongoose = require('mongoose');

// MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let currentRetry = 0;

  // Check if MONGODB_URI is set
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onedrly';
  
  // Provide helpful message if using default URI
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  MONGODB_URI not set in .env, using default: mongodb://127.0.0.1:27017/onedrly');
    console.log('💡 To use MongoDB Atlas, set MONGODB_URI in your .env file');
    console.log('💡 To use local MongoDB, make sure MongoDB is running on localhost:27017');
  }

  while (currentRetry < maxRetries) {
    try {
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return conn;
    } catch (error) {
      currentRetry++;
      
      // Provide specific error messages
      let errorMessage = error.message;
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Is MongoDB running?';
      } else if (error.message.includes('authentication failed')) {
        errorMessage = 'Authentication failed. Check username/password in MONGODB_URI';
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        errorMessage = 'Cannot resolve hostname. Check your MONGODB_URI';
      }
      
      console.error(`❌ MongoDB connection attempt ${currentRetry}/${maxRetries} failed:`, errorMessage);
      
      if (currentRetry >= maxRetries) {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Could not connect to MongoDB after maximum retries');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error('💡 Troubleshooting steps:');
        console.error('   1. Check if MongoDB is running (for local MongoDB)');
        console.error('   2. Verify MONGODB_URI in .env file is correct');
        console.error('   3. For MongoDB Atlas: Check network access (IP whitelist)');
        console.error('   4. For MongoDB Atlas: Verify username/password');
        console.error('   5. Check internet connection (for MongoDB Atlas)');
        console.error('');
        console.error('📝 Example .env configuration:');
        console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onedrly?retryWrites=true&w=majority');
        console.error('');
        console.error('⚠️  Server will start, but user management features will not work');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, currentRetry), 10000);
      console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔒 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;

