# 🚀 MongoDB Quick Start - 5 Minutes Setup

## ✅ What You Need

1. **MongoDB Atlas Account** (Free)
2. **5 Minutes** of your time

---

## 📝 Step-by-Step Setup

### 1️⃣ Get MongoDB Connection String (2 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** → Sign up/Login
3. Create a **FREE M0 Cluster** (512MB - Perfect for development)
4. **Security Setup:**
   - Create Database User:
     - Username: `onedrly_user`
     - Password: (auto-generate and copy)
   - Network Access:
     - Click "Add IP Address"
     - Select "Allow Access from Anywhere" (`0.0.0.0/0`)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://onedrly_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 2️⃣ Update .env File (1 minute)

Open `destination-information/backend/.env` and add:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://onedrly_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/onedrly?retryWrites=true&w=majority

# JWT Secret (generate with command below)
JWT_SECRET=paste-the-generated-secret-here
JWT_EXPIRE=30d
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** Replace:
- `<password>` with your actual database password
- Add database name `onedrly` before the `?` in the connection string
- Replace `JWT_SECRET` with the generated secret

### 3️⃣ Install Dependencies (1 minute)

```bash
cd destination-information/backend
npm install
```

This installs:
- `mongoose` (MongoDB)
- `bcryptjs` (Password hashing)
- `jsonwebtoken` (Authentication)
- `express-validator` (Validation)

### 4️⃣ Start Backend (1 minute)

```bash
npm start
```

**Success! You should see:**
```
🗄️  MongoDB Connected: cluster0-xxxxx.mongodb.net
📊 Database: onedrly
🚀 ONEDRLY BACKEND API - OPTIMIZED
...
👤 User Management APIs:
   ✅ Auth:        http://localhost:3000/api/auth
   ✅ Profile:     http://localhost:3000/api/users
   ✅ Bookings:    http://localhost:3000/api/bookings
   ✅ Favorites:   http://localhost:3000/api/favorites
```

---

## 🧪 Test It Works!

### Test 1: Register a User

**Windows PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Or use Browser Console (F12):**
```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 2: View in MongoDB

1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. See your new `users` collection with the user data!

---

## 🎯 What You Can Do Now

### All User Data is Stored:

✅ **User Profiles** - Name, email, preferences, travel settings  
✅ **Bookings** - Flights, hotels, trains, buses, rides  
✅ **Search History** - Every search users make  
✅ **Favorites** - Saved destinations, hotels, places  
✅ **Reviews** - User reviews with ratings  
✅ **Trip Planning** - Complete itineraries with activities  

### Available API Endpoints:

| Category | Endpoint | Description |
|----------|----------|-------------|
| 🔐 Auth | `POST /api/auth/register` | Register new user |
| 🔐 Auth | `POST /api/auth/login` | Login user |
| 👤 Profile | `GET /api/users/profile` | Get user profile |
| 👤 Profile | `PUT /api/users/profile` | Update profile |
| 📦 Bookings | `POST /api/bookings` | Create booking |
| 📦 Bookings | `GET /api/bookings` | Get all bookings |
| ⭐ Favorites | `POST /api/favorites` | Add favorite |
| ⭐ Favorites | `GET /api/favorites` | Get favorites |
| 🔍 Search | `GET /api/search-history` | Get search history |
| ⭐ Reviews | `POST /api/reviews` | Create review |
| ✈️ Trips | `POST /api/trips` | Create trip plan |

**See full API documentation:** `MONGODB_SETUP.md`

---

## 🔧 Troubleshooting

### ❌ "MongoDB connection failed"
- Check internet connection
- Verify password in connection string (no special characters issues)
- Whitelist IP: `0.0.0.0/0` in Network Access
- Make sure database name is added to URI

### ❌ "JWT must be provided"
- Missing `JWT_SECRET` in `.env` file
- Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### ❌ "npm install" fails
- Make sure you're in `destination-information/backend/` directory
- Delete `node_modules` and `package-lock.json`, try again
- Update npm: `npm install -g npm@latest`

### ❌ "Cannot find module"
- Run `npm install` again
- Check you're running `npm start` from backend directory

---

## 📁 Files Created

```
backend/
├── config/
│   └── database.js          ← MongoDB connection
├── models/
│   ├── User.js              ← User profiles
│   ├── Booking.js           ← Bookings data
│   ├── SearchHistory.js     ← Search tracking
│   ├── Favorite.js          ← Favorites
│   ├── Review.js            ← Reviews
│   └── Trip.js              ← Trip planning
├── routes/
│   ├── auth.js              ← Authentication routes
│   ├── users.js             ← User management
│   ├── bookings.js          ← Booking routes
│   ├── favorites.js         ← Favorites routes
│   ├── search-history.js    ← Search routes
│   ├── reviews.js           ← Review routes
│   └── trips.js             ← Trip routes
├── middleware/
│   └── auth.js              ← JWT authentication
├── .env                     ← Your config (update this!)
└── package.json             ← Updated with new packages
```

---

## 🎉 You're Done!

Your backend now stores **EVERYTHING** about users:
- 🔒 Secure authentication with JWT
- 💾 Complete data persistence in MongoDB
- 🚀 Production-ready API endpoints
- 📊 Automatic data validation

**Next:** Integrate with your Angular frontend!

---

## 💡 Pro Tips

1. **MongoDB Compass** - Download to view database visually
2. **Postman** - Best tool for testing APIs
3. **VS Code REST Client** - Test APIs directly in VS Code
4. **Keep .env secret** - Never commit to Git!

---

**Need Help?** Check `MONGODB_SETUP.md` for detailed documentation!

