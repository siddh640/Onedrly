# 📝 YOUR backend/.env FILE - Complete Guide

## 📍 **File Location:**

```
backend/.env
```

**Full path:**
```
C:\Users\siddh\OneDrive\Desktop\Wandrly\Wandrly (Destination information)\destination-information\backend\.env
```

**✅ This file EXISTS in your project!**

---

## 🔧 **How to Open It:**

### **Option 1: In VS Code**
1. Press **Ctrl+P**
2. Type: **`.env`**
3. Press **Enter**
4. File opens!

### **Option 2: In File Explorer**
1. Open folder: `backend`
2. Look for file: `.env`
3. Right-click → "Open with VS Code" or "Notepad"

---

## ✏️ **What Your .env File Should Contain:**

Copy this **ENTIRE content** into your `backend/.env` file:

```env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WANDRLY BACKEND - API KEYS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Server Configuration (Don't change these)
PORT=3000
NODE_ENV=development
ENABLE_CACHE=true
CACHE_TTL_SECONDS=300

# Weather Data (Already working - leave as is)
OPENWEATHER_API_KEY=724b2996b7c101c6669520e167bb44dc

# ═══════════════════════════════════════════════════════════
# ✈️ STEP 1: ADD AMADEUS API KEYS (For Real Flights)
# ═══════════════════════════════════════════════════════════
# Get from: https://developers.amadeus.com/register
# Time: 15 minutes | FREE
#
# After creating account and app, you'll get 2 values:
# - Client ID (copy the entire string)
# - Client Secret (click eye icon to reveal, then copy)
#
# REPLACE "your_xxx" with your actual keys:

AMADEUS_CLIENT_ID=your_amadeus_client_id_here
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
AMADEUS_BASE_URL=https://test.api.amadeus.com

# ═══════════════════════════════════════════════════════════
# 🏨 STEP 2: ADD RAPIDAPI KEY (For Real Hotels & Trains)
# ═══════════════════════════════════════════════════════════
# Get from: https://rapidapi.com/auth/sign-up
# Time: 15 minutes | FREE
#
# After signing up:
# 1. Go to: https://rapidapi.com/developer/dashboard
# 2. Copy your "Default Application" API key
# 3. Subscribe to FREE APIs:
#    - Booking.com: https://rapidapi.com/apidojo/api/booking
#    - RailYatri: https://rapidapi.com/railyatri/api/railyatri
#
# REPLACE with your actual key:

RAPIDAPI_KEY=your_rapidapi_key_here

# ═══════════════════════════════════════════════════════════
# 📍 STEP 3: ADD GOOGLE PLACES KEY (Optional - Better Places)
# ═══════════════════════════════════════════════════════════
# Get from: https://console.cloud.google.com/
# Time: 10 minutes | FREE ($200/month credit)
# Note: Needs credit card but won't charge
#
# REPLACE with your actual key:

GOOGLE_PLACES_API_KEY=your_google_api_key_here

# ═══════════════════════════════════════════════════════════
# OPTIONAL APIS (Skip these for now)
# ═══════════════════════════════════════════════════════════

UNSPLASH_ACCESS_KEY=your_unsplash_key_here
UBER_SERVER_TOKEN=your_uber_token_here
KIWI_API_KEY=your_kiwi_key_here
AVIATIONSTACK_API_KEY=your_aviationstack_key_here

# ═══════════════════════════════════════════════════════════
# DONE! After adding keys, restart backend:
# cd backend
# node server.js
# ═══════════════════════════════════════════════════════════
```

---

## 📋 **Step-by-Step Instructions:**

### **FOR AMADEUS (Real Flights):**

**1. Open this page** (I already opened it for you):
```
https://developers.amadeus.com/register
```

**2. Sign up and create app**

**3. You'll get 2 values:**
```
Client ID: abc123def456xyz789
Client Secret: xyz789uvw123abc456
```

**4. In your .env file, replace:**
```env
AMADEUS_CLIENT_ID=your_amadeus_client_id_here
```
**With:**
```env
AMADEUS_CLIENT_ID=abc123def456xyz789
```

**5. And replace:**
```env
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
```
**With:**
```env
AMADEUS_CLIENT_SECRET=xyz789uvw123abc456
```

---

### **FOR RAPIDAPI (Real Hotels & Trains):**

**1. Open this page** (I already opened it for you):
```
https://rapidapi.com/auth/sign-up
```

**2. Sign up**

**3. Go to dashboard:**
```
https://rapidapi.com/developer/dashboard
```

**4. Copy your API key** (looks like):
```
1234567890abcdefghijklmnopqrstuvwxyz123456
```

**5. In your .env file, replace:**
```env
RAPIDAPI_KEY=your_rapidapi_key_here
```
**With:**
```env
RAPIDAPI_KEY=1234567890abcdefghijklmnopqrstuvwxyz123456
```

**6. Subscribe to FREE APIs:**
- **Booking.com**: https://rapidapi.com/apidojo/api/booking
- **RailYatri**: https://rapidapi.com/railyatri/api/railyatri

---

## ✅ **Checklist:**

```
Current Status:
[ ] .env file exists ✅ YES!
[ ] .env file is open in editor
[ ] Got Amadeus Client ID
[ ] Got Amadeus Client Secret
[ ] Added Amadeus keys to .env
[ ] Got RapidAPI key
[ ] Subscribed to Booking.com API
[ ] Subscribed to RailYatri API
[ ] Added RapidAPI key to .env
[ ] Saved .env file (Ctrl+S)
[ ] Restarted backend server
[ ] Tested website - seeing real data!
```

---

## 🎯 **After Adding Keys and Restarting:**

### **Backend will show:**
```
✅ Server running on port 3000
✅ Amadeus API configured - Real flight data enabled!
✅ RapidAPI configured!
✅ Booking.com API enabled - Real hotels
✅ RailYatri API enabled - Real trains
```

### **Your website will show:**
```
✈️ Flights: LIVE prices from airlines
🏨 Hotels: REAL availability from Booking.com
🚂 Trains: ACTUAL schedules from IRCTC
```

---

## 🔄 **How to Restart Backend:**

**In terminal where backend is running:**
1. Press **Ctrl+C** (stops server)
2. Type: `node server.js`
3. Press **Enter**

**OR in new terminal:**
```bash
cd backend
node server.js
```

---

## 🆘 **Common Issues:**

### **"Syntax error" when starting backend:**
- Check for typos in .env file
- Make sure no spaces around `=` sign
- Make sure no quotes around values

### **"API key invalid":**
- Double-check you copied the complete key
- No extra spaces at beginning/end
- Try copying again from source

### **"Can't find .env file":**
- It's in the `backend` folder
- File name is exactly: `.env` (with the dot)
- Make sure "Show hidden files" is enabled

---

## 💡 **Pro Tip:**

**To quickly edit .env in VS Code:**
1. Press **Ctrl+P**
2. Type: **backend/.env**
3. Press **Enter**
4. Edit!
5. Save: **Ctrl+S**

---

## 📞 **Need Help?**

**Tell me:**
- "Open .env file for me" → I'll try to help
- "I got Amadeus keys" → I'll help you add them
- "I got RapidAPI key" → I'll help you add it
- "Show me .env example" → I'll show full example
- "Test if keys work" → I'll verify your setup

---

**Your .env file is ready to receive API keys!** 🔑✨

**Start getting real-time data now!** 🚀

