# 🚀 Quick Fix: MongoDB Connection Issue

## Current Status
✅ Backend server is running on port 3000  
✅ JWT_SECRET is configured  
❌ MongoDB is NOT connected  

## Quick Solution (Choose One)

### Option 1: MongoDB Atlas (5 minutes - Recommended) ⭐

**Easiest and fastest way to get MongoDB running:**

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (free account)
3. **Create Free Cluster**:
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Click "Create"
4. **Create Database User**:
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `onedrly_user` (or any username)
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"
5. **Whitelist IP Address**:
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
6. **Get Connection String**:
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. **Update .env file**:
   - Open `backend/.env`
   - Find: `MONGODB_URI=your_mongodb_connection_string_here`
   - Replace with: `MONGODB_URI=mongodb+srv://onedrly_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/onedrly?retryWrites=true&w=majority`
   - Replace `YOUR_PASSWORD` with the password you created
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
   - Save the file
8. **Restart Backend**:
   - Stop the backend (Ctrl+C)
   - Run: `npm start`
   - You should see: `✅ MongoDB Connected`

**Done!** 🎉

---

### Option 2: Local MongoDB (10 minutes)

**If you prefer to run MongoDB on your computer:**

1. **Download MongoDB**:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Click "Download"

2. **Install MongoDB**:
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**:
   - MongoDB should start automatically as a Windows service
   - Check Windows Services: Press `Win+R`, type `services.msc`, look for "MongoDB"

4. **Update .env file** (if needed):
   - Open `backend/.env`
   - The default connection string should work: `mongodb://127.0.0.1:27017/onedrly`
   - If MONGODB_URI is set to the placeholder, change it to: `MONGODB_URI=mongodb://127.0.0.1:27017/onedrly`

5. **Restart Backend**:
   - Stop the backend (Ctrl+C)
   - Run: `npm start`
   - You should see: `✅ MongoDB Connected`

**Done!** 🎉

---

## Verify Connection

After restarting, you should see in the backend console:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️  MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: onedrly
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MongoDB connection established
🗄️  MongoDB: Connected
```

If you see this, MongoDB is connected! ✅

---

## Still Having Issues?

### Error: "Connection refused"
- **MongoDB Atlas**: Check IP whitelist (should be 0.0.0.0/0)
- **Local MongoDB**: Check if MongoDB service is running

### Error: "Authentication failed"
- Check username and password in connection string
- Make sure password doesn't have special characters that need URL encoding

### Error: "Cannot resolve hostname"
- Check your internet connection (for MongoDB Atlas)
- Verify the connection string is correct

### Run Setup Script Again:
```bash
cd backend
node setup-mongodb.js
```

---

## Need Help?

1. Check the setup script output: `node setup-mongodb.js`
2. Check backend logs for specific error messages
3. Verify .env file has correct MONGODB_URI format

---

**Once MongoDB is connected, your registration/login will work!** 🚀

