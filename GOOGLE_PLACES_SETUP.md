# 🚀 Google Places API Setup - Get REAL-TIME Accurate Data!

## 🎯 Why Google Places API?

Google Places API gives you:
- ✅ **REAL verified photos** from Google Maps
- ✅ **ACCURATE ratings** from millions of Google users
- ✅ **REAL-TIME data** that's always up to date
- ✅ **Complete business information** (phone, website, hours)
- ✅ **User reviews** and review counts
- ✅ **Verified addresses** and locations
- ✅ **Current open/closed status**
- ✅ **Price levels** and categories

**This is the SAME data that Google Maps uses!**

---

## 📝 Step-by-Step Setup (10 Minutes)

### Step 1: Create Google Cloud Account

1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Accept terms of service
4. **You get $200 FREE credit every month!**

### Step 2: Create a New Project

1. Click **"Select a project"** at the top
2. Click **"NEW PROJECT"**
3. Project name: `Wandrly` (or any name)
4. Click **"CREATE"**
5. Wait for project to be created (10-20 seconds)
6. Make sure your new project is selected

### Step 3: Enable Places API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Places API"**
3. Click on **"Places API"**
4. Click **"ENABLE"**
5. Wait for it to enable (10 seconds)

### Step 4: Enable Additional APIs (Optional but Recommended)

Enable these for even better data:
- **Places API (New)** - Next-generation Places API
- **Geocoding API** - Better address lookup
- **Place Photos API** - More photos

To enable each:
1. Search for the API name
2. Click on it
3. Click "ENABLE"

### Step 5: Create API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. Your API key will be displayed - **COPY IT!**
5. Click **"RESTRICT KEY"** (important for security)

### Step 6: Restrict Your API Key (Security)

1. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check: **Places API**
   - Check: **Geocoding API** (optional)
   - Check: **Place Photos API** (optional)

2. Under **"Application restrictions"** (Optional):
   - Select **"HTTP referrers"**
   - Add: `http://localhost:*`
   - Add: `https://yourdomainname.com/*` (when you deploy)

3. Click **"SAVE"**

### Step 7: Enable Billing (Required, but FREE)

Google requires billing to be enabled, but you get **$200 FREE credit/month**:

1. Go to: https://console.cloud.google.com/billing
2. Click **"LINK A BILLING ACCOUNT"**
3. Click **"CREATE BILLING ACCOUNT"**
4. Enter your name and address
5. Add a payment method (credit/debit card)
6. Click **"START MY FREE TRIAL"**

**Note**: You WON'T be charged unless you exceed $200/month (which is ~40,000 requests!)

---

## 🔧 Step 8: Configure Your API Key

### Create `.env` File in Backend

1. Open your backend folder:
```bash
cd destination-information/backend
```

2. Create a file named `.env` (with the dot at the start)

3. Add your API key:
```env
# Google Places API (for most accurate data)
GOOGLE_PLACES_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Existing settings (keep these)
PORT=3000
NODE_ENV=development
ENABLE_CACHE=true
CACHE_TTL=600
```

4. Save the file

### Verify Your Setup

1. Open `backend/services/google-places-service.js`
2. It should automatically detect your API key and use it!

---

## 🚀 Step 9: Restart Backend

Stop the current backend (Ctrl+C) and restart:

```bash
cd destination-information/backend
node server.js
```

You should see in the console:
```
✅ Using Google Places API for accurate data
```

---

## 📊 What Data You'll Get

### Before (OpenStreetMap Only):
- Place names
- Basic addresses
- Random ratings
- Generic photos from Unsplash

### After (Google Places API):
- ✅ **Verified business names**
- ✅ **REAL Google ratings** (from millions of users)
- ✅ **REAL review counts**
- ✅ **High-quality photos** from Google Maps
- ✅ **Accurate addresses** (street, city, postal code)
- ✅ **Phone numbers** (verified)
- ✅ **Websites** (official)
- ✅ **Opening hours** (e.g., "Mon-Fri 9AM-6PM")
- ✅ **Current status** (Open/Closed right now)
- ✅ **Price level** ($ to $$$$)
- ✅ **Business types** (restaurant, museum, etc.)
- ✅ **Wheelchair accessible** info
- ✅ **Delivery/Takeout** options (for restaurants)
- ✅ **Reservations** available or not
- ✅ **Popular times** (when it's busy)

---

## 💰 Pricing (FREE for most users)

### Free Tier:
- **$200 FREE credit every month**
- Resets monthly
- No commitment

### What $200 Gets You:
- **~40,000** Place Searches
- **~100,000** Place Details requests
- **~1,000,000** Place Photos

### Example Usage:
- 100 users/day searching 10 destinations each = **30,000 requests/month**
- Well within FREE tier! ✅

### If You Exceed $200/month:
- You'll be notified
- Set spending limits in Google Cloud Console
- Can always disable billing

---

## 🔒 Security Best Practices

### 1. Never Commit `.env` File to Git

The `.env` file is already in `.gitignore`, but verify:

```bash
# Check if .gitignore includes .env
cat .gitignore | grep .env
```

If not there, add it:
```bash
echo ".env" >> .gitignore
```

### 2. Restrict API Key

We did this in Step 6:
- Only allow specific APIs
- Only allow specific domains

### 3. Monitor Usage

Check your usage regularly:
1. Go to: https://console.cloud.google.com/apis/dashboard
2. View usage graphs
3. Set up alerts for high usage

---

## 🧪 Test Your Setup

### Test Backend Directly

```bash
# In PowerShell or Command Prompt
curl http://localhost:3000/api/places/search/Paris
```

You should see:
```json
{
  "success": true,
  "source": "google_places",
  "data": {
    "attractions": [
      {
        "name": "Eiffel Tower",
        "rating": 4.6,
        "userRatingsTotal": 450123,
        "photos": ["https://maps.googleapis.com/..."],
        ...
      }
    ]
  }
}
```

Notice `"source": "google_places"` - this confirms Google API is working!

### Test Frontend

1. Open: http://localhost:4200
2. Search for: **"Paris"**
3. Click on: **"Tourist Attractions"**
4. You should see:
   - **High-quality photos** from Google
   - **Real ratings** (e.g., 4.6/5.0)
   - **Real review counts** (e.g., "450,123 reviews")
   - **Verified information**

---

## 🐛 Troubleshooting

### Error: "API key not valid"
- Check if API key is correct in `.env`
- Make sure Places API is enabled
- Wait 5-10 minutes after creating key (propagation delay)

### Error: "Billing not enabled"
- Go to Google Cloud Console
- Enable billing as described in Step 7

### Still Using OpenStreetMap Data
- Check if `.env` file exists in `backend` folder
- Restart backend server
- Check console for: "✅ Using Google Places API"

### Error: "Request denied"
- Check API restrictions in Google Cloud Console
- Make sure you enabled Places API
- Try removing restrictions temporarily to test

---

## 📈 Monitoring Your Usage

### Check Usage Stats:
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project
3. View graphs for:
   - Requests per day
   - Errors
   - Latency

### Set Up Budget Alerts:
1. Go to: https://console.cloud.google.com/billing
2. Click "Budgets & alerts"
3. Create alert for $50, $100, $150

---

## 🎉 You're All Set!

After setup, your platform will have:
- ✅ **REAL data from Google Maps**
- ✅ **ACCURATE ratings from millions of users**
- ✅ **HIGH-QUALITY verified photos**
- ✅ **UP-TO-DATE information**
- ✅ **PROFESSIONAL results** like Google Maps

**This will make your platform 10x better!** 🚀

---

## 🔄 Fallback System

Don't worry - if Google API fails or you hit limits:
- ✅ Automatically falls back to OpenStreetMap
- ✅ Then falls back to Wikipedia photos
- ✅ Never shows empty data
- ✅ Seamless experience for users

---

## 📞 Support

### Google Cloud Support:
- https://cloud.google.com/support

### API Documentation:
- https://developers.google.com/maps/documentation/places/web-service/overview

### Your Backend Code:
- `backend/services/google-places-service.js` - Main logic
- `backend/routes/places.js` - API endpoint

---

## ✅ Checklist

- [ ] Created Google Cloud account
- [ ] Created new project
- [ ] Enabled Places API
- [ ] Created API key
- [ ] Restricted API key
- [ ] Enabled billing (FREE tier)
- [ ] Created `backend/.env` file
- [ ] Added API key to `.env`
- [ ] Restarted backend server
- [ ] Tested with a search
- [ ] Verified Google data is being used

---

**Once completed, you'll have the MOST ACCURATE travel data platform!** 🌍✨
