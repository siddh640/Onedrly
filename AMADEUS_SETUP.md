# ✈️ AMADEUS API SETUP - Get REAL Flight Data in 15 Minutes

## 🎯 **Why Amadeus?**

Amadeus is the **#1 source** for real-time flight data:
- ✅ Used by **major airlines** worldwide
- ✅ **500+ airlines** covered
- ✅ **Live prices** updated every hour
- ✅ **Real availability** and seat counts
- ✅ **1,000 FREE searches/month**
- ✅ **No credit card** required for free tier

---

## ⏱️ **Complete Setup: 15 Minutes**

### **Step 1: Create Account (3 minutes)**

1. **Go to**: https://developers.amadeus.com/register

2. **Fill in the form**:
   - Email: your_email@example.com
   - Name: Your Name
   - Company: Wandrly (or your company)
   - Country: India
   - Phone: Your number

3. **Click** "Create account"

4. **Verify email**: Check your inbox and click the verification link

---

### **Step 2: Create Application (5 minutes)**

1. **Log in** to: https://developers.amadeus.com/my-apps

2. **Click** "Create New App"

3. **Fill in details**:
   - **App Name**: Wandrly
   - **App Description**: Travel booking and comparison platform
   - **App Type**: Web application

4. **Click** "Create"

5. **You'll see your credentials**:
   ```
   API Key (Client ID): abc123def456...
   API Secret (Client Secret): xyz789uvw...
   ```

---

### **Step 3: Copy Your Credentials (2 minutes)**

You'll see a screen with:
```
Self-Service
Test Environment

API Key: abc123def456xyz789...
API Secret: ••••••••••••••••••• (click to reveal)
```

**Click** the "eye" icon to reveal your API Secret.

**IMPORTANT**: Copy BOTH values!

---

### **Step 4: Add to Your Backend (3 minutes)**

1. **Open**: `backend/.env` (create if it doesn't exist)

2. **Add these lines**:
   ```env
   # Amadeus API - Real Flight Data
   AMADEUS_CLIENT_ID=abc123def456xyz789
   AMADEUS_CLIENT_SECRET=xyz789uvw123abc456
   AMADEUS_BASE_URL=https://test.api.amadeus.com
   ```
   (Replace with your actual credentials)

3. **Save** the file

---

### **Step 5: Restart Backend (2 minutes)**

**In terminal:**
```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
node server.js
```

**Look for this message:**
```
✅ Amadeus API configured - Real flight data enabled!
```

---

### **Step 6: Test Real Flight Data (1 minute)**

1. **Open**: http://localhost:4200
2. **Search**: Mumbai → Delhi
3. **Check Flights tab**

**You should now see:**
- ✅ **Real airlines**: Air India, IndiGo, Vistara
- ✅ **Real prices**: Updated from live data
- ✅ **Real schedules**: Actual departure times
- ✅ **Real availability**: Current seat counts

---

## 🎉 **You're Done!**

**Amadeus Free Tier Limits:**
- ✅ 1,000 API calls/month
- ✅ ~33 flight searches/day
- ✅ Perfect for development & testing
- ✅ No credit card required

---

## 🔧 **Troubleshooting**

### **"Invalid credentials" error:**
- Make sure you copied BOTH Client ID and Client Secret
- No spaces before/after the values
- Use Test environment credentials (not Production)

### **"No flights found":**
- Amadeus requires IATA codes (BOM, DEL, etc.)
- Your API automatically converts city names
- Try searching major cities first

### **"Rate limit exceeded":**
- You've used 1,000 calls this month
- Wait for next month OR upgrade to paid tier
- Switch to generated data temporarily

---

## 📊 **What You Get:**

### **Real Flight Data Includes:**

- ✅ **Airline name** (e.g., "Air India")
- ✅ **Flight number** (e.g., "AI860")
- ✅ **Actual price** (live from airline)
- ✅ **Real departure time**
- ✅ **Real arrival time**
- ✅ **Flight duration**
- ✅ **Number of stops**
- ✅ **Seat availability**
- ✅ **Cabin class options**
- ✅ **Baggage allowance**
- ✅ **Fare rules**

---

## 🚀 **Upgrade to Production (When Ready):**

When you're ready to launch publicly:

1. **Request Production access** in Amadeus dashboard
2. **Get Production credentials**
3. **Update** `AMADEUS_BASE_URL`:
   ```
   AMADEUS_BASE_URL=https://api.amadeus.com
   ```
4. **Production limits**: 10,000+ calls/month

---

## 🌟 **Next Steps:**

After Amadeus is working, set up:
- 📌 **RapidAPI** for hotels and trains
- 📌 **Google Places** for place data
- 📌 **Uber API** for ride estimates

**See `GET_REAL_TIME_DATA.md` for complete guide!**

---

## ✅ **Summary:**

**Time**: 15 minutes  
**Cost**: FREE  
**Result**: Real flight data from 500+ airlines worldwide  
**Limit**: 1,000 searches/month (33/day)  

**Start now**: https://developers.amadeus.com/register 🚀

