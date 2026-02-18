#!/usr/bin/env node

/**
 * MongoDB Setup Helper Script
 * This script helps you configure MongoDB for the Onedrly backend
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 MongoDB Setup Helper');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created!');
  } else {
    console.error('❌ env.example not found!');
    process.exit(1);
  }
  console.log('');
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if MONGODB_URI is configured
const mongodbUriMatch = envContent.match(/^MONGODB_URI=(.+)$/m);
const hasMongoUri = mongodbUriMatch && mongodbUriMatch[1] && !mongodbUriMatch[1].includes('your_mongodb_connection_string_here');

// Check if JWT_SECRET is configured
const jwtSecretMatch = envContent.match(/^JWT_SECRET=(.+)$/m);
const hasJwtSecret = jwtSecretMatch && jwtSecretMatch[1] && !jwtSecretMatch[1].includes('your-secret-key-change-in-production');

console.log('📊 Current Configuration Status:');
console.log('');

if (hasMongoUri) {
  const uri = mongodbUriMatch[1];
  const maskedUri = uri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
  console.log('✅ MONGODB_URI: Configured');
  console.log(`   ${maskedUri}`);
} else {
  console.log('❌ MONGODB_URI: NOT configured');
}

if (hasJwtSecret) {
  console.log('✅ JWT_SECRET: Configured');
} else {
  console.log('❌ JWT_SECRET: NOT configured');
}

console.log('');

// Generate JWT_SECRET if not set
if (!hasJwtSecret) {
  console.log('🔑 Generating JWT_SECRET...');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  if (envContent.includes('JWT_SECRET=your-secret-key-change-in-production')) {
    envContent = envContent.replace(
      'JWT_SECRET=your-secret-key-change-in-production',
      `JWT_SECRET=${jwtSecret}`
    );
  } else if (envContent.includes('JWT_SECRET=')) {
    envContent = envContent.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${jwtSecret}`);
  } else {
    envContent += `\nJWT_SECRET=${jwtSecret}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ JWT_SECRET generated and saved!');
  console.log('');
}

// Provide MongoDB setup instructions
if (!hasMongoUri) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 MongoDB Setup Required');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('You have two options:');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OPTION 1: MongoDB Atlas (Cloud - Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to: https://www.mongodb.com/cloud/atlas');
  console.log('2. Sign up for FREE account');
  console.log('3. Create a FREE cluster (M0 Sandbox)');
  console.log('4. Create database user:');
  console.log('   - Go to "Database Access" → "Add New Database User"');
  console.log('   - Choose "Password" authentication');
  console.log('   - Set username and password (save these!)');
  console.log('5. Whitelist IP address:');
  console.log('   - Go to "Network Access" → "Add IP Address"');
  console.log('   - Click "Allow Access from Anywhere" (0.0.0.0/0)');
  console.log('6. Get connection string:');
  console.log('   - Go to "Database" → Click "Connect"');
  console.log('   - Choose "Connect your application"');
  console.log('   - Copy the connection string');
  console.log('   - Replace <password> with your database password');
  console.log('   - Replace <database> with "onedrly"');
  console.log('');
  console.log('Example connection string:');
  console.log('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/onedrly?retryWrites=true&w=majority');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OPTION 2: Local MongoDB');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Install MongoDB Community Edition:');
  console.log('   https://www.mongodb.com/try/download/community');
  console.log('2. Start MongoDB service:');
  console.log('   Windows: MongoDB should start automatically');
  console.log('   Or run: mongod');
  console.log('3. The default connection string will be used:');
  console.log('   mongodb://127.0.0.1:27017/onedrly');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. Open the .env file in: backend/.env');
  console.log('2. Find the line: MONGODB_URI=your_mongodb_connection_string_here');
  console.log('3. Replace it with your MongoDB connection string');
  console.log('4. Save the file');
  console.log('5. Restart the backend server');
  console.log('');
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Configuration Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Your MongoDB is configured. Restart the backend server:');
  console.log('  npm start');
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

