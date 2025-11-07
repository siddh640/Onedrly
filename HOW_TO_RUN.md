# 🚀 How to Run Your Wandrly Platform

## ✅ All Errors Fixed! Ready to Run!

---

## 📋 Prerequisites

Make sure you have:
- [x] Node.js installed (v18 or higher)
- [x] npm installed
- [x] Backend dependencies installed
- [x] Frontend dependencies installed

---

## 🎯 Running the Platform

### **You Need 2 Terminals:**

---

### **TERMINAL 1: Start Backend API**

```bash
cd "C:\Users\siddh\OneDrive\Desktop\Wandrly\Wandrly (Destination information)\destination-information\backend"
npm start
```

**You should see**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 WANDRLY BACKEND API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running on: http://localhost:3000
🌍 Environment: development
📊 Health check: http://localhost:3000/health

📡 Available APIs:
   ✅ Weather:  http://localhost:3000/api/weather
   ✅ Places:   http://localhost:3000/api/places
   ✅ Flights:  http://localhost:3000/api/flights
   ✅ Hotels:   http://localhost:3000/api/hotels
   ✅ Trains:   http://localhost:3000/api/trains
   ✅ Buses:    http://localhost:3000/api/buses
   ✅ Rides:    http://localhost:3000/api/rides

💡 Cache enabled: true
🔒 Rate limiting: Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

✅ **Backend is ready!** Leave this terminal running.

---

### **TERMINAL 2: Start Frontend App**

**Open a NEW terminal window**, then:

```bash
cd "C:\Users\siddh\OneDrive\Desktop\Wandrly\Wandrly (Destination information)\destination-information"
npm start
```

**You should see**:
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.

  Local:   http://localhost:4200/
  
** Angular Live Development Server is listening on localhost:4200 **
```

✅ **Frontend is ready!**

---

### **BROWSER: Open Your App**

**Automatically opens**: http://localhost:4200

**Or manually open**: http://localhost:4200

---

## 🎯 Testing Everything

### **Test 1: Homepage Loads**
```
✅ Should see Wandrly homepage
✅ Search bar visible
✅ "Discover Your Next Adventure" text
```

### **Test 2: Search Destination**
```
1. Type: "Paris"
2. Click: Search button
3. ✅ Should see results page
4. ✅ Weather widget appears
5. ✅ "Book Travel" button appears
6. ✅ Attractions/Restaurants/Shopping appear
```

### **Test 3: Weather Widget**
```
1. Click on weather widget
2. ✅ Expands to show details
3. ✅ Click "Show 5-Day Forecast"
4. ✅ Forecast displays
5. ✅ Rain prediction shows
```

### **Test 4: Travel Booking**
```
1. Click: "Book Flights, Hotels & More" button
2. ✅ Modal opens
3. ✅ Destination pre-filled with "Paris"
4. Fill in:
   - From: "Mumbai"
   - Departure Date: Tomorrow
   - Passengers: 2
5. Click: "Search Travel Options"
6. ✅ See flights tab with results
7. ✅ See hotels tab with results
8. ✅ See trains, buses, rides tabs
9. Click: "Book Now" on any option
10. ✅ Get booking confirmation!
```

**All working? SUCCESS!** 🎉

---

## 🐛 Troubleshooting

### **Issue: Backend won't start**

**Error**: "Cannot find module"
**Solution**:
```bash
cd backend
npm install
npm start
```

---

### **Issue: Frontend won't compile**

**Error**: TypeScript errors
**Solution**: Already fixed! Just run:
```bash
npm start
```

---

### **Issue: Port already in use**

**Error**: "Port 3000 already in use"
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

---

### **Issue: Can't connect to backend**

**Check**:
1. Backend is running (Terminal 1)
2. Shows "Server running on port 3000"
3. Test: http://localhost:3000/health
4. Should return JSON with status "OK"

---

### **Issue: Modal doesn't open**

**Check**:
1. Browser console (F12)
2. Look for errors
3. Refresh page (Ctrl+R)
4. Clear cache (Ctrl+Shift+R)

---

## 📊 What Should Be Running

### **Terminal 1** (Backend):
```
✅ Node.js server
✅ Port 3000
✅ API endpoints active
✅ Caching enabled
✅ No errors
```

### **Terminal 2** (Frontend):
```
✅ Angular dev server
✅ Port 4200
✅ Compiled successfully
✅ No errors
```

### **Browser**:
```
✅ http://localhost:4200
✅ Wandrly homepage
✅ All features working
```

---

## 🎯 Quick Commands Reference

### **Install Dependencies**:
```bash
# Backend
cd destination-information/backend
npm install

# Frontend
cd destination-information
npm install
```

### **Start Servers**:
```bash
# Backend (Terminal 1)
cd destination-information/backend
npm start

# Frontend (Terminal 2)
cd destination-information
npm start
```

### **Stop Servers**:
```
Press Ctrl+C in each terminal
```

### **Restart Servers**:
```
Ctrl+C (stop)
npm start (restart)
```

---

## ✅ Success Indicators

### **Backend Started Successfully**:
```
✅ Shows "WANDRLY BACKEND API"
✅ Lists all 7 API endpoints
✅ No error messages
✅ Shows cache and rate limiting active
```

### **Frontend Started Successfully**:
```
✅ Shows "Compiled successfully"
✅ Opens browser automatically
✅ No TypeScript errors
✅ Page loads
```

### **Everything Working**:
```
✅ Can search destinations
✅ Weather shows
✅ Book button works
✅ Modal opens
✅ Travel search works
✅ Results display
✅ Can book items
```

---

## 🎨 Visual Confirmation

When everything is running correctly, you should see:

### **Terminal 1** (Backend):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 WANDRLY BACKEND API
📍 Server running on: http://localhost:3000
✅ Weather:  http://localhost:3000/api/weather
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Terminal 2** (Frontend):
```
** Angular Live Development Server is listening **
✔ Compiled successfully
```

### **Browser**:
```
┌────────────────────────────────────┐
│         🌍 Wandrly                 │
│   Discover Your Next Adventure     │
│  [Search Destination: _______] 🔍 │
└────────────────────────────────────┘
```

---

## 🎉 You're Ready!

**Both servers running?** ✅
**No errors?** ✅
**Page loads?** ✅

**START EXPLORING YOUR PLATFORM!** 🌍✈️

---

## 💡 Pro Tips

### **Tip 1**: Keep both terminals open
- Don't close Terminal 1 (backend)
- Don't close Terminal 2 (frontend)

### **Tip 2**: Watch for changes
- Frontend auto-reloads on code changes
- Backend needs manual restart

### **Tip 3**: Check backend logs
- Terminal 1 shows API requests
- Helpful for debugging

### **Tip 4**: Use browser dev tools
- Press F12 to see console
- Check Network tab for API calls
- Verify data flow

---

## 🚀 READY TO TEST!

**Now that everything is running**:

1. **Search** for "Tokyo" or "Mumbai"
2. **See weather** (real-time!)
3. **Click** "Book Travel"
4. **Search flights**
5. **See results** from your API!
6. **Book something**
7. **Get confirmation**!

**Everything working!** 🎊


