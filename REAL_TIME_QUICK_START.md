# 🚀 REAL-TIME DATA - 30 Minute Quick Start

## ⚡ **Get Live, Dynamic Data in 30 Minutes!**

I just opened these pages in your browser:
1. ✅ **Amadeus** (for flights)
2. ✅ **RapidAPI** (for hotels & trains)

Follow this guide to set them up!

---

## 📋 **PART 1: AMADEUS - Real Flight Data (15 mins)**

### **What's Open in Your Browser:**
https://developers.amadeus.com/register

### **What to Do:**

**1. Fill the registration form:**
```
Email: your_email@gmail.com
First Name: Your Name
Last Name: Your Last Name
Company: Wandrly
Country: India
```

**2. Click "Create account"**

**3. Check your email** → Click verification link

**4. Log in** → You'll see dashboard

**5. Click "Create New App":**
```
App Name: Wandrly
Description: Travel booking platform
```

**6. You'll see your credentials:**
```
API Key (Client ID): abc123def456...
API Secret: xyz789uvw... (click eye icon to see)
```

**7. Copy BOTH values!**

**8. Open file**: `backend/.env`

**9. Add these lines:**
```env
AMADEUS_CLIENT_ID=abc123def456...
AMADEUS_CLIENT_SECRET=xyz789uvw...
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

**10. Save file** (Ctrl+S)

**✅ DONE! Amadeus configured!**

---

## 📋 **PART 2: RAPIDAPI - Real Hotels & Trains (15 mins)**

### **What's Open in Your Browser:**
https://rapidapi.com/auth/sign-up

### **What to Do:**

**1. Sign up:**
- Use email OR sign up with Google

**2. After login, go to:**
https://rapidapi.com/developer/dashboard

**3. You'll see "Default Application"**
- Copy the API Key (long string)

**4. Now subscribe to FREE APIs:**

**A. Booking.com API** (Hotels):
- Go to: https://rapidapi.com/apidojo/api/booking
- Click "Subscribe to Test"
- Select "Basic" (FREE)
- Click "Subscribe"

**B. RailYatri API** (Trains):
- Go to: https://rapidapi.com/railyatri/api/railyatri  
- Click "Subscribe to Test"
- Select "Basic" (FREE)
- Click "Subscribe"

**5. Open file**: `backend/.env`

**6. Add this line:**
```env
RAPIDAPI_KEY=your_copied_key_here
```

**7. Save file** (Ctrl+S)

**✅ DONE! RapidAPI configured!**

---

## 🔄 **PART 3: Restart Backend (2 mins)**

**In terminal:**

1. **Stop backend**: Press Ctrl+C in backend terminal

2. **Restart**:
   ```bash
   cd backend
   node server.js
   ```

3. **Look for these messages:**
   ```
   ✅ Amadeus API configured - Real flight data enabled!
   ✅ RapidAPI configured!
   ✅ Booking.com API enabled - Real hotels
   ✅ RailYatri API enabled - Real trains
   ```

**✅ DONE! Real-time data is LIVE!**

---

## 🧪 **TEST IT (1 min)**

1. **Refresh browser**: http://localhost:4200

2. **Search**: Mumbai → Delhi

3. **See the difference**:

### **Flights Tab:**
```
BEFORE: Simulated data
AFTER:  ✅ LIVE prices from airlines
        ✅ Real flight numbers
        ✅ Actual schedules
```

### **Hotels Tab:**
```
BEFORE: Generic hotels
AFTER:  ✅ REAL hotels from Booking.com
        ✅ Live availability
        ✅ Actual reviews
```

### **Trains Tab:**
```
BEFORE: Estimated times
AFTER:  ✅ REAL trains from IRCTC
        ✅ Live seat availability
        ✅ Actual schedules
```

---

## ✅ **Your `backend/.env` File Should Look Like:**

```env
# Server
PORT=3000
ENABLE_CACHE=true

# Weather (already working)
OPENWEATHER_API_KEY=724b2996b7c101c6669520e167bb44dc

# REAL-TIME FLIGHTS
AMADEUS_CLIENT_ID=abc123def456xyz789
AMADEUS_CLIENT_SECRET=xyz789uvw123abc456
AMADEUS_BASE_URL=https://test.api.amadeus.com

# REAL-TIME HOTELS & TRAINS
RAPIDAPI_KEY=abc123def456ghi789jkl012mno345pqr678

# OPTIONAL - Better place data
GOOGLE_PLACES_API_KEY=AIzaSyD...
```

---

## 🎯 **Summary:**

### **What to Do:**
1. ✅ Sign up at Amadeus (15 mins)
2. ✅ Sign up at RapidAPI (15 mins)
3. ✅ Copy API keys
4. ✅ Add to `backend/.env`
5. ✅ Restart backend
6. ✅ Enjoy real-time data!

### **What You Get:**
- ✅ **Live flight prices**
- ✅ **Real hotel availability**
- ✅ **Actual train schedules**
- ✅ **Dynamic updates**
- ✅ **100% FREE** (within limits)

---

## 🆘 **Need Help?**

**Having trouble?** Tell me:
- "Help with Amadeus" → I'll guide you through flights
- "Help with RapidAPI" → I'll guide you through hotels/trains
- "Show me my .env file" → I'll help you configure it
- "Test if it's working" → I'll verify your setup

---

## 📚 **Detailed Guides:**

- **`AMADEUS_SETUP.md`** - Complete Amadeus setup (flights)
- **`RAPIDAPI_SETUP.md`** - Complete RapidAPI setup (hotels/trains)
- **`GOOGLE_PLACES_SETUP.md`** - Google Places setup (place data)
- **`GET_REAL_TIME_DATA.md`** - Overview of all APIs

---

## 🔥 **Ready to Start?**

**I opened these pages for you:**
- ✅ Amadeus registration
- ✅ RapidAPI signup

**Just follow the steps above!**

**When you get your keys, tell me and I'll help you add them!** 🚀

---

**Total Time**: 30 minutes  
**Total Cost**: $0 (FREE)  
**Result**: REAL-TIME dynamic data! ✨

