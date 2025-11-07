# 🔑 ADD YOUR API KEYS HERE - Simple Instructions

## 📍 **Your .env File Location:**

```
backend/.env
```

**To open it:**
- **VS Code**: Press `Ctrl+P` → Type `.env` → Enter
- **Notepad**: Run command `notepad backend\.env`

---

## ✏️ **What to Add to Your .env File:**

Your `.env` file currently has basic configuration. You need to **ADD these lines** at the bottom:

---

### **COPY THIS and ADD to bottom of backend/.env:**

```env
# ═══════════════════════════════════════════════════════════
# REAL-TIME DATA API KEYS
# ═══════════════════════════════════════════════════════════

# OpenWeather (Already working - leave as is)
OPENWEATHER_API_KEY=724b2996b7c101c6669520e167bb44dc

# ✈️ AMADEUS - Real Flight Data
# Sign up: https://developers.amadeus.com/register
# After signup, replace the values below with your credentials:
AMADEUS_CLIENT_ID=your_amadeus_client_id_here
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
AMADEUS_BASE_URL=https://test.api.amadeus.com

# 🏨 RAPIDAPI - Real Hotels & Trains  
# Sign up: https://rapidapi.com/auth/sign-up
# After signup, replace the value below with your API key:
RAPIDAPI_KEY=your_rapidapi_key_here

# 📍 GOOGLE PLACES - Verified Place Data (Optional)
# Already in your file - add your key when ready:
# GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

---

## 🎯 **When You Get Your Keys:**

### **Example - After Getting Amadeus Keys:**

You'll receive:
```
Client ID: aBcD1234EfGh5678
Client Secret: XyZ9876WqRtY5432
```

**In your .env file, change:**
```env
AMADEUS_CLIENT_ID=your_amadeus_client_id_here
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
```

**To:**
```env
AMADEUS_CLIENT_ID=aBcD1234EfGh5678
AMADEUS_CLIENT_SECRET=XyZ9876WqRtY5432
```

**Simple! Just replace the text after the `=` sign!**

---

## 🔄 **After Editing:**

### **1. Save the file**
Press `Ctrl+S`

### **2. Restart backend server**

**In backend terminal:**
- Press `Ctrl+C` (stops server)
- Type: `node server.js`
- Press Enter

**You'll see:**
```
✅ Amadeus API configured - Real flight data enabled!
✅ RapidAPI configured!
✅ Server running on port 3000
```

---

## 📊 **Summary:**

### **Your .env File Contains:**
✅ Server configuration (PORT, etc.)
✅ Google Places API placeholder
✅ **Need to ADD**: Amadeus keys
✅ **Need to ADD**: RapidAPI key

### **To Get Real-Time Data:**
1. Sign up at Amadeus and RapidAPI
2. Copy your API keys
3. Add to `backend/.env`
4. Save and restart

**Time**: 30 minutes  
**Cost**: FREE  
**Result**: Live, dynamic, real-time data! 🎉

---

## 🚀 **Get Started:**

**I already opened these pages for you:**
- ✅ Amadeus: https://developers.amadeus.com/register
- ✅ RapidAPI: https://rapidapi.com/auth/sign-up

**Follow guide:**
- `START_HERE_REALTIME.md` (easiest to follow)

---

## 💡 **Currently:**

Your website works with **realistic simulated data**.

**After adding API keys:**

Your website will work with **REAL-TIME live data from actual sources**!

---

**Tell me when you have your API keys and I'll help you add them!** 🔑✨

