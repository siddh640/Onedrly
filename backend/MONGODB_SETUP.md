# 🗄️ MongoDB Integration - Complete User Data Storage

Your Onedrly backend now stores **ALL user data** in MongoDB! This includes profiles, bookings, favorites, search history, reviews, and trip planning.

---

## 📋 What's Been Added

### 1. **Database Models (Schemas)**
✅ **User** - Complete user profiles with authentication  
✅ **Booking** - All flight/hotel/train/bus/ride bookings  
✅ **SearchHistory** - Track every search users make  
✅ **Favorite** - Save favorite destinations, hotels, places  
✅ **Review** - User reviews with ratings and photos  
✅ **Trip** - Complete trip planning with itineraries  

### 2. **API Endpoints Created**

#### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Change password
- `DELETE /api/auth/delete-account` - Delete account

#### 👤 User Profile (`/api/users`)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile (name, phone, bio, etc.)
- `PUT /api/users/preferences` - Update preferences (currency, language, travel preferences)
- `GET /api/users/stats` - Get user statistics (total bookings, spent, etc.)

#### 📦 Bookings (`/api/bookings`)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all user bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/filter/upcoming` - Get upcoming bookings
- `GET /api/bookings/filter/past` - Get past bookings

#### ⭐ Favorites (`/api/favorites`)
- `POST /api/favorites` - Add to favorites
- `GET /api/favorites` - Get all favorites
- `GET /api/favorites/:id` - Get single favorite
- `PUT /api/favorites/:id` - Update favorite (notes, tags, priority)
- `DELETE /api/favorites/:id` - Remove from favorites
- `POST /api/favorites/check` - Check if item is favorited

#### 🔍 Search History (`/api/search-history`)
- `POST /api/search-history` - Save search
- `GET /api/search-history` - Get search history
- `GET /api/search-history/recent` - Get recent searches (last 10)
- `GET /api/search-history/popular-destinations` - Get most searched destinations
- `DELETE /api/search-history/:id` - Delete specific search
- `DELETE /api/search-history` - Clear all search history

#### ⭐ Reviews (`/api/reviews`)
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get user's reviews
- `GET /api/reviews/item/:externalId` - Get reviews for specific item
- `GET /api/reviews/:id` - Get single review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful

#### ✈️ Trip Planning (`/api/trips`)
- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:id` - Get single trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/add-booking` - Add booking to trip
- `POST /api/trips/:id/add-photo` - Add photo to trip
- `GET /api/trips/filter/upcoming` - Get upcoming trips

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create account
3. Create a **FREE** cluster (M0 Sandbox)
4. Create database user (username + password)
5. Whitelist your IP: `0.0.0.0/0` (allow all)
6. Click "Connect" → "Connect your application"
7. Copy the connection string

### Step 2: Configure Environment Variables

1. Open `destination-information/backend/.env` file
2. Add these lines (replace with your values):

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onedrly?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
JWT_EXPIRE=30d
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Install Dependencies

```bash
cd destination-information/backend
npm install
```

New packages installed:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation

### Step 4: Start Backend

```bash
npm start
```

You should see:
```
🗄️  MongoDB Connected: cluster0-xxxxx.mongodb.net
📊 Database: onedrly
```

---

## 🧪 Testing the APIs

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create a Booking (Protected Route)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bookingType": "flight",
    "tripDetails": {
      "origin": { "name": "New York", "code": "JFK" },
      "destination": { "name": "London", "code": "LHR" },
      "departureDate": "2025-12-01",
      "tripType": "round-trip"
    },
    "travelers": [{
      "type": "adult",
      "firstName": "John",
      "lastName": "Doe"
    }],
    "pricing": {
      "baseFare": 500,
      "taxes": 50,
      "totalAmount": 550,
      "currency": "USD"
    },
    "payment": {
      "method": "credit-card",
      "paymentStatus": "completed"
    }
  }'
```

### 4. Add to Favorites

```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "favoriteType": "destination",
    "itemDetails": {
      "externalId": "paris-france",
      "name": "Paris",
      "description": "The City of Light",
      "location": {
        "city": "Paris",
        "country": "France"
      }
    }
  }'
```

---

## 🔑 Authentication Flow

### Protected Routes
All routes except `/api/auth/register`, `/api/auth/login`, and `/api/reviews/item/:id` require authentication.

### How to Use:

1. **Register or Login** - Get JWT token
2. **Store Token** - Save in frontend (localStorage/sessionStorage)
3. **Send Token** - Include in all API requests:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Example with Fetch (JavaScript):

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📊 User Data Stored

### User Profile
- Personal info (name, email, phone, DOB, gender)
- Profile picture, bio, nationality, passport
- Preferences (currency, language, notifications)
- Travel preferences (seat, meal, accommodation)
- Account status and verification

### Bookings
- All booking types: flights, hotels, trains, buses, rides, packages
- Complete trip details (origin, destination, dates)
- Traveler information
- Detailed pricing breakdown
- Payment details and status
- Cancellation information

### Search History
- Every search users make
- Search parameters and filters
- Results count and conversions
- Device information
- Auto-deletes after 90 days

### Favorites
- Destinations, hotels, places, attractions
- User notes and custom tags
- Priority/wishlist ranking
- Visit status and dates
- Trip association

### Reviews
- Ratings (overall + sub-ratings)
- Title, content, photos
- Pros and cons lists
- Helpful votes tracking
- Verification status
- Moderation system

### Trip Planning
- Trip name, destination, dates
- Budget tracking (estimated vs actual)
- Complete itinerary with activities
- Packing lists
- Documents storage
- Photo gallery
- Member management (shared trips)

---

## 🎨 Frontend Integration

### Update Angular Service (example)

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  register(userData: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }
  
  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }
  
  getProfile() {
    return this.http.get(`${this.apiUrl}/users/profile`, {
      headers: this.getAuthHeaders()
    });
  }
  
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
```

---

## 🔒 Security Features

✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Input Validation** - express-validator  
✅ **Protected Routes** - Middleware authentication  
✅ **CORS Protection** - Configured origins  
✅ **Rate Limiting** - Prevent abuse  
✅ **Helmet.js** - Security headers  

---

## 📦 Database Structure

```
onedrly (database)
├── users
├── bookings
├── searchhistories
├── favorites
├── reviews
└── trips
```

All collections are automatically created when first used!

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check internet connection
- Verify MongoDB URI in `.env`
- Whitelist your IP in MongoDB Atlas
- Check username/password

### Authentication Error
- Verify JWT_SECRET is set in `.env`
- Check token is being sent in headers
- Token format: `Bearer <token>`

### API Not Found
- Ensure backend is running on port 3000
- Check route paths match documentation
- Verify HTTP method (GET/POST/PUT/DELETE)

---

## 📈 Next Steps

1. **Integrate with Frontend** - Update Angular services
2. **Add File Upload** - For profile pictures and trip photos
3. **Email Notifications** - Booking confirmations
4. **Payment Gateway** - Stripe/PayPal integration
5. **Admin Panel** - Manage users and moderate reviews

---

## 💡 Tips

- Use Postman or Insomnia for API testing
- Check MongoDB Compass to view database
- Monitor server logs for errors
- Keep JWT_SECRET secure and never commit to Git
- Regular database backups recommended

---

## 🎉 You're All Set!

Your Onedrly app now stores complete user data in MongoDB. Users can:
- ✅ Register and login
- ✅ Save bookings
- ✅ Track search history
- ✅ Manage favorites
- ✅ Write reviews
- ✅ Plan trips

**Happy Coding! 🚀**

