# 🔧 EARNLANG Troubleshooting Guide

## "Failed to fetch" Error Solutions

### 1. **Check if Server is Running**
```bash
# Make sure the server is started
npm start

# You should see:
# ✅ MongoDB connected
# 🎮 EARNLANG Game Server running on port 5000
# 🌐 Main Site: http://localhost:5000
# 🛠️ Admin Panel: http://localhost:5000/admin
```

### 2. **Check MongoDB Connection**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Or check if MongoDB is running
mongo --eval "db.runCommand('ping')"
```

### 3. **Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Common errors:
   - CORS errors
   - Network errors
   - JavaScript errors

### 4. **Test API Endpoints**
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"EARNLANG Game Server Running"}
```

### 5. **Check File Structure**
Make sure all files exist:
```
earnlang/
├── server.js ✅
├── routes/
│   ├── authRoutes.js ✅
│   ├── taskRoutes.js ✅
│   ├── userRoutes.js ✅
│   ├── adminRoutes.js ✅
│   └── payoutRoutes.js ✅
├── middleware/
│   ├── auth.js ✅
│   └── adminAuth.js ✅
└── models/
    ├── User.js ✅
    ├── Task.js ✅
    ├── TaskCompletion.js ✅
    └── Payout.js ✅
```

### 6. **Common Issues & Solutions**

#### Issue: "Cannot find module"
**Solution:** Install dependencies
```bash
npm install
```

#### Issue: "MongoDB connection error"
**Solution:** Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Issue: "Port already in use"
**Solution:** Change port or kill process
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env
PORT=3000
```

#### Issue: CORS errors
**Solution:** Check CORS configuration in server.js
```javascript
app.use(cors());
```

### 7. **Step-by-Step Debugging**

1. **Start fresh:**
   ```bash
   # Stop server (Ctrl+C)
   # Clear node_modules
   rm -rf node_modules package-lock.json
   
   # Reinstall
   npm install
   
   # Start server
   npm start
   ```

2. **Check logs:**
   ```bash
   # Look for error messages in terminal
   # Check browser console (F12)
   # Check network tab in browser
   ```

3. **Test endpoints manually:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Login test
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@earnlang.com","password":"admin123"}'
   ```

### 8. **Environment Variables**
Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/earnlang
JWT_SECRET=your_secret_key_here
```

### 9. **Browser Issues**

#### Clear browser cache:
1. Press Ctrl+Shift+Delete
2. Clear all data
3. Refresh page

#### Try different browser:
- Chrome
- Firefox
- Edge

#### Disable browser extensions:
- Some extensions block requests
- Try incognito/private mode

### 10. **Network Issues**

#### Check firewall:
- Allow Node.js through firewall
- Allow port 5000

#### Check antivirus:
- Some antivirus blocks local servers
- Add exception for localhost:5000

### 11. **Still Not Working?**

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be 14+ or higher
   ```

2. **Check npm version:**
   ```bash
   npm --version
   ```

3. **Reinstall Node.js:**
   - Download from https://nodejs.org/
   - Install with "Add to PATH" checked

4. **Contact support:**
   - Check GitHub issues
   - Create new issue with error details

### 12. **Quick Fix Commands**

```bash
# Complete reset
rm -rf node_modules package-lock.json
npm install
node setup.js
npm start
```

### 13. **Expected Behavior**

When working correctly:
- ✅ Server starts without errors
- ✅ MongoDB connects successfully
- ✅ Health endpoint returns OK
- ✅ Login page loads
- ✅ Admin panel loads
- ✅ No "Failed to fetch" errors

### 14. **Test Credentials**

**Admin:**
- Email: admin@earnlang.com
- Password: admin123

**Demo User:**
- Email: demo@earnlang.com
- Password: demo123

---

**Need more help?** Check the console logs and error messages for specific details about what's failing. 