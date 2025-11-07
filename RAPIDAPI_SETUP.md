# 🏨 RAPIDAPI SETUP - Get REAL Hotels & Trains in 15 Minutes

## 🎯 **Why RapidAPI?**

**ONE key gives you access to 100+ travel APIs!**

With RapidAPI, you get real-time data for:
- ✅ **Hotels** (Booking.com, Hotels.com, Agoda)
- ✅ **Trains** (RailYatri, IRCTC for India)
- ✅ **Flights** (Skyscanner comparison)
- ✅ **And much more!**

---

## ⏱️ **Complete Setup: 15 Minutes**

### **Step 1: Create RapidAPI Account (3 minutes)**

1. **Go to**: https://rapidapi.com/auth/sign-up

2. **Sign up** with:
   - Email: your_email@example.com
   - Password: (create strong password)
   - OR sign up with Google/GitHub

3. **Verify email** (check inbox)

4. **Log in** to: https://rapidapi.com/

---

### **Step 2: Get Your API Key (2 minutes)**

1. **Go to**: https://rapidapi.com/developer/dashboard

2. **Find "Default Application"** section

3. **Copy your API Key**:
   ```
   Your key looks like:
   abc123def456ghi789jkl012mno345pqr678
   ```

**IMPORTANT:** This is your master key for ALL APIs on RapidAPI!

---

### **Step 3: Subscribe to Travel APIs (8 minutes)**

#### **A. Booking.com API (Hotels)** 🏨

1. **Go to**: https://rapidapi.com/apidojo/api/booking

2. **Click** "Subscribe to Test"

3. **Select** "Basic" plan (FREE):
   - 500 requests/month
   - No credit card required

4. **Click** "Subscribe"

**Status:** ✅ You can now search 2.5 million hotels worldwide!

---

#### **B. RailYatri API (Indian Trains)** 🚂

1. **Go to**: https://rapidapi.com/railyatri/api/railyatri

2. **Click** "Subscribe to Test"

3. **Select** "Basic" plan (FREE):
   - 100 requests/month
   - No credit card required

4. **Click** "Subscribe"

**Status:** ✅ You can now get real Indian Railway data!

---

#### **C. Skyscanner Flight Search (Bonus)** ✈️

1. **Go to**: https://rapidapi.com/skyscanner/api/skyscanner-flight-search

2. **Click** "Subscribe to Test"

3. **Select** "Basic" plan (FREE):
   - 100 requests/month
   - No credit card required

4. **Click** "Subscribe"

**Status:** ✅ Additional flight price comparison!

---

### **Step 4: Add Key to Backend (2 minutes)**

1. **Open**: `backend/.env`

2. **Add this line**:
   ```env
   # RapidAPI - Master Key for Hotels, Trains, Flights
   RAPIDAPI_KEY=abc123def456ghi789jkl012mno345pqr678
   ```
   (Use YOUR actual key)

3. **Save** the file

---

### **Step 5: Restart Backend (1 minute)**

**Stop current backend** (Ctrl+C in backend terminal)

**Restart:**
```bash
cd backend
node server.js
```

**Look for:**
```
✅ RapidAPI configured!
✅ Booking.com API enabled - Real hotels
✅ RailYatri API enabled - Real trains
✅ Skyscanner API enabled - Flight comparison
```

---

### **Step 6: Test Real Data (1 minute)**

1. **Open**: http://localhost:4200

2. **Search**: Mumbai → Delhi

3. **Check results**:
   - **Hotels**: Should show real hotels from Booking.com
   - **Trains**: Should show real Indian Railway trains
   - **Flights**: Additional options from Skyscanner

---

## 🎉 **You're Done!**

With just ONE RapidAPI key, you now have access to:

### **Real Hotel Data:**
- ✅ 2.5 million properties worldwide
- ✅ Live prices from Booking.com
- ✅ Real availability
- ✅ Actual reviews
- ✅ 500 searches/month FREE

### **Real Train Data (India):**
- ✅ All Indian Railway trains
- ✅ Live PNR status
- ✅ Real seat availability
- ✅ Actual schedules
- ✅ 100 searches/month FREE

### **Flight Comparison:**
- ✅ Additional price comparison
- ✅ Cheap flight finder
- ✅ 100 searches/month FREE

---

## 📊 **Free Tier Limits:**

### **Booking.com API:**
- **500 requests/month** = ~16 hotel searches/day
- **No credit card** required
- **Upgrade**: $50/month for 10,000 requests

### **RailYatri API:**
- **100 requests/month** = ~3 train searches/day
- **No credit card** required
- **Upgrade**: Contact for pricing

### **Skyscanner API:**
- **100 requests/month** = ~3 flight comparisons/day
- **No credit card** required
- **Upgrade**: Contact for pricing

**Perfect for development and moderate traffic!**

---

## 🌍 **Coverage:**

### **Hotels (Booking.com):**
- ✅ **220+ countries**
- ✅ **2.5 million properties**
- ✅ **29 million listings**
- ✅ **Apartments, villas, resorts**

### **Trains (RailYatri):**
- ✅ **All Indian Railway routes**
- ✅ **13,000+ trains**
- ✅ **8,000+ stations**
- ✅ **PNR prediction**

---

## 🔧 **Troubleshooting:**

### **"Invalid API key":**
- Copy the key from: https://rapidapi.com/developer/dashboard
- Make sure no spaces before/after the key
- Key should be ~40 characters long

### **"Not subscribed to API":**
- Visit each API page (Booking.com, RailYatri)
- Click "Subscribe to Test"
- Select "Basic (Free)" plan

### **"Rate limit exceeded":**
- You've used your free quota for this month
- Upgrade plan OR wait for next month
- Temporarily use generated data

---

## 💡 **Pro Tips:**

### **Monitor Your Usage:**
1. Go to: https://rapidapi.com/developer/dashboard
2. See API call counts per API
3. Track remaining quota

### **Manage Subscriptions:**
1. Go to: https://rapidapi.com/developer/billing/subscriptions
2. See all active subscriptions
3. Upgrade or cancel as needed

### **Test APIs:**
RapidAPI has built-in testing - try before integrating!

---

## 🚀 **What Happens Next:**

### **After Adding RapidAPI Key:**

**Hotels:**
```
BEFORE: "The Taj Palace Delhi" (generated)
AFTER: "Taj Palace, New Delhi" (REAL from Booking.com)
        + Real photos
        + Real reviews
        + Live availability
        + Actual pricing
```

**Trains:**
```
BEFORE: "Rajdhani Express" (estimated)
AFTER: "12301 Rajdhani Express" (REAL from Indian Railways)
        + Real departure time
        + Live seat availability
        + PNR prediction
        + Actual fare
```

---

## ✅ **Quick Reference:**

**Sign up**: https://rapidapi.com/auth/sign-up  
**Dashboard**: https://rapidapi.com/developer/dashboard  
**Booking.com API**: https://rapidapi.com/apidojo/api/booking  
**RailYatri API**: https://rapidapi.com/railyatri/api/railyatri  

**Your `.env` file**:
```env
RAPIDAPI_KEY=your_key_here
```

---

## 🎉 **Start Now!**

**Click here**: https://rapidapi.com/auth/sign-up

**Time**: 15 minutes  
**Cost**: FREE  
**Result**: Real hotel + train data  

**Let's get you real-time data!** 🚀

