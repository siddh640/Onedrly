# 📡 API Endpoints Reference

Complete list of all available endpoints for user data management.

---

## 🔐 Authentication Endpoints

Base URL: `http://localhost:3000/api/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | ❌ No | Register a new user |
| POST | `/login` | ❌ No | Login and get JWT token |
| GET | `/me` | ✅ Yes | Get current logged in user |
| PUT | `/update-password` | ✅ Yes | Change user password |
| DELETE | `/delete-account` | ✅ Yes | Delete user account |

### Example: Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Example: Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 User Profile Endpoints

Base URL: `http://localhost:3000/api/users`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/profile` | ✅ Yes | Get user profile |
| PUT | `/profile` | ✅ Yes | Update user profile |
| PUT | `/preferences` | ✅ Yes | Update user preferences |
| GET | `/stats` | ✅ Yes | Get user statistics |

### Example: Update Profile
```json
PUT /api/users/profile
Headers: { Authorization: "Bearer YOUR_TOKEN" }
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "female",
  "bio": "Love to travel!",
  "nationality": "USA"
}
```

### Example: Update Preferences
```json
PUT /api/users/preferences
{
  "currency": "EUR",
  "language": "en",
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "travelPreferences": {
    "seatPreference": "window",
    "mealPreference": "vegetarian",
    "accommodationType": "luxury"
  }
}
```

---

## 📦 Booking Endpoints

Base URL: `http://localhost:3000/api/bookings`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Yes | Create new booking |
| GET | `/` | ✅ Yes | Get all user bookings |
| GET | `/:id` | ✅ Yes | Get single booking |
| PUT | `/:id` | ✅ Yes | Update booking |
| POST | `/:id/cancel` | ✅ Yes | Cancel booking |
| GET | `/filter/upcoming` | ✅ Yes | Get upcoming bookings |
| GET | `/filter/past` | ✅ Yes | Get past bookings |

### Query Parameters for GET /bookings:
- `status` - Filter by status (confirmed, pending, cancelled, completed)
- `type` - Filter by type (flight, hotel, train, bus, ride, package)
- `sort` - Sort field (default: -createdAt)
- `limit` - Results per page (default: 20)
- `page` - Page number (default: 1)

### Example: Create Booking
```json
POST /api/bookings
{
  "bookingType": "flight",
  "tripDetails": {
    "origin": { "name": "New York", "code": "JFK" },
    "destination": { "name": "London", "code": "LHR" },
    "departureDate": "2025-12-01",
    "returnDate": "2025-12-10",
    "tripType": "round-trip"
  },
  "travelers": [
    {
      "type": "adult",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "gender": "male"
    }
  ],
  "flightDetails": {
    "airline": "British Airways",
    "flightNumber": "BA123",
    "cabin": "economy",
    "stops": 0,
    "duration": "7h 30m"
  },
  "pricing": {
    "baseFare": 500,
    "taxes": 50,
    "fees": 20,
    "totalAmount": 570,
    "currency": "USD"
  },
  "payment": {
    "method": "credit-card",
    "paymentStatus": "completed",
    "transactionId": "TXN123456"
  },
  "bookingStatus": "confirmed"
}
```

---

## ⭐ Favorites Endpoints

Base URL: `http://localhost:3000/api/favorites`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Yes | Add item to favorites |
| GET | `/` | ✅ Yes | Get all favorites |
| GET | `/:id` | ✅ Yes | Get single favorite |
| PUT | `/:id` | ✅ Yes | Update favorite |
| DELETE | `/:id` | ✅ Yes | Remove from favorites |
| POST | `/check` | ✅ Yes | Check if item is favorited |

### Example: Add to Favorites
```json
POST /api/favorites
{
  "favoriteType": "destination",
  "itemDetails": {
    "externalId": "paris-france-123",
    "name": "Paris",
    "description": "The City of Light",
    "imageUrl": "https://example.com/paris.jpg",
    "location": {
      "city": "Paris",
      "country": "France",
      "coordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      }
    },
    "rating": {
      "value": 4.8,
      "count": 15000
    },
    "priceLevel": "expensive",
    "category": ["destination", "city", "culture"],
    "tags": ["romantic", "museums", "food"]
  },
  "userNotes": "Want to visit in spring 2026!",
  "userTags": ["honeymoon", "bucket-list"],
  "priority": 5
}
```

---

## 🔍 Search History Endpoints

Base URL: `http://localhost:3000/api/search-history`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Yes | Save search |
| GET | `/` | ✅ Yes | Get search history |
| GET | `/recent` | ✅ Yes | Get recent searches (last 10) |
| GET | `/popular-destinations` | ✅ Yes | Get most searched destinations |
| DELETE | `/:id` | ✅ Yes | Delete specific search |
| DELETE | `/` | ✅ Yes | Clear all search history |

### Example: Save Search
```json
POST /api/search-history
{
  "searchType": "flight",
  "searchParams": {
    "origin": {
      "name": "New York",
      "code": "JFK"
    },
    "destination": {
      "name": "Tokyo",
      "code": "NRT"
    },
    "departureDate": "2025-12-15",
    "returnDate": "2025-12-25",
    "adults": 2,
    "children": 1,
    "class": "economy"
  },
  "resultsCount": 45
}
```

---

## ⭐ Review Endpoints

Base URL: `http://localhost:3000/api/reviews`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Yes | Create review |
| GET | `/` | ✅ Yes | Get user's reviews |
| GET | `/item/:externalId` | ❌ No | Get reviews for specific item |
| GET | `/:id` | ❌ No | Get single review |
| PUT | `/:id` | ✅ Yes | Update review |
| DELETE | `/:id` | ✅ Yes | Delete review |
| POST | `/:id/helpful` | ✅ Yes | Mark review as helpful |

### Example: Create Review
```json
POST /api/reviews
{
  "reviewType": "hotel",
  "itemDetails": {
    "externalId": "hotel-xyz-123",
    "name": "Grand Hotel Paris",
    "location": {
      "city": "Paris",
      "country": "France"
    }
  },
  "rating": {
    "overall": 5,
    "cleanliness": 5,
    "service": 5,
    "valueForMoney": 4,
    "location": 5,
    "amenities": 4
  },
  "title": "Amazing Stay in Paris!",
  "content": "Had a wonderful experience at this hotel. The staff was incredibly friendly and the location was perfect for exploring the city. Highly recommend!",
  "visitDate": "2025-08-15",
  "tripType": "couple",
  "pros": ["Great location", "Friendly staff", "Clean rooms"],
  "cons": ["Breakfast could be better"],
  "photos": [
    {
      "url": "https://example.com/photo1.jpg",
      "caption": "View from room"
    }
  ]
}
```

---

## ✈️ Trip Planning Endpoints

Base URL: `http://localhost:3000/api/trips`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | ✅ Yes | Create new trip |
| GET | `/` | ✅ Yes | Get all user trips |
| GET | `/:id` | ✅ Yes | Get single trip |
| PUT | `/:id` | ✅ Yes | Update trip |
| DELETE | `/:id` | ✅ Yes | Delete trip |
| POST | `/:id/add-booking` | ✅ Yes | Add booking to trip |
| POST | `/:id/add-photo` | ✅ Yes | Add photo to trip |
| GET | `/filter/upcoming` | ✅ Yes | Get upcoming trips |

### Example: Create Trip
```json
POST /api/trips
{
  "tripName": "European Adventure 2025",
  "destination": {
    "name": "Paris",
    "country": "France",
    "coordinates": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  },
  "startDate": "2025-12-01",
  "endDate": "2025-12-10",
  "status": "planning",
  "tripType": "couple",
  "budget": {
    "estimated": 5000,
    "currency": "USD"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "2025-12-01",
      "activities": [
        {
          "time": "10:00 AM",
          "title": "Eiffel Tower Visit",
          "description": "Visit the iconic Eiffel Tower",
          "location": {
            "name": "Eiffel Tower",
            "address": "Champ de Mars, Paris",
            "coordinates": {
              "latitude": 48.8584,
              "longitude": 2.2945
            }
          },
          "duration": "2 hours",
          "cost": 25
        }
      ]
    }
  ],
  "notes": "Don't forget passports and travel insurance!"
}
```

---

## 🔑 Authentication

### Protected Routes
All endpoints (except registration, login, and public reviews) require authentication.

### How to Authenticate:

1. **Get Token**: Register or login to receive JWT token
2. **Store Token**: Save in localStorage or sessionStorage
3. **Send Token**: Include in Authorization header

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

### Token Format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTQ4ZjNlNGY...
```

---

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Pagination Response:
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": {
    // Array of items
  }
}
```

---

## 🧪 Testing Tools

### 1. Browser Console (F12)
```javascript
// Register
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
}).then(r => r.json()).then(console.log);

// Login and Get Bookings
const token = 'YOUR_TOKEN';
fetch('http://localhost:3000/api/bookings', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

### 2. PowerShell (Windows)
```powershell
# Register
$body = @{ email="test@example.com"; password="password123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"

# Get Profile
$token = "YOUR_TOKEN"
Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Headers @{Authorization="Bearer $token"}
```

### 3. cURL (Linux/Mac)
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

**Happy Coding! 🚀**

