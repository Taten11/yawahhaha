# 🗄️ MongoDB Atlas Setup for EARNLANG

## 🎯 **Your MongoDB Atlas Connection**

You have a MongoDB Atlas cluster ready! Here's how to configure EARNLANG to use it:

### **Your Connection String:**
```
mongodb+srv://earnlang:<db_password>@cluster0.0ku8feb.mongodb.net/
```

## 📝 **Step 1: Create Environment File**

Create a `.env` file in your EARNLANG root directory:

```env
# EARNLANG Environment Configuration
# ======================================

# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://earnlang:<db_password>@cluster0.0ku8feb.mongodb.net/earnlang?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=earnlang_super_secret_jwt_key_2024_change_this_in_production

# Email Configuration (for email verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Security Configuration
CORS_ORIGIN=http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Application Settings
MIN_PAYOUT_AMOUNT=50
POINTS_TO_PESO_RATIO=10
MAX_PAYOUT_AMOUNT=10000
```

## 🔑 **Step 2: Replace Placeholders**

### **Replace `<db_password>` with your actual password**
```env
MONGO_URI=mongodb+srv://earnlang:YOUR_ACTUAL_PASSWORD@cluster0.0ku8feb.mongodb.net/earnlang?retryWrites=true&w=majority
```

### **Update Email Settings (Optional)**
```env
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 🚀 **Step 3: Install Dependencies**

```bash
npm install
```

## 🗄️ **Step 4: Setup Database**

```bash
node setup.js
```

This will create the necessary collections in your Atlas database.

## 🔗 **Step 5: Connect MongoDB Compass to Atlas**

### **Connection String for Compass:**
```
mongodb+srv://earnlang:YOUR_PASSWORD@cluster0.0ku8feb.mongodb.net/earnlang
```

### **Steps:**
1. Open MongoDB Compass
2. Click "New Connection"
3. Paste the connection string
4. Replace `YOUR_PASSWORD` with your actual password
5. Click "Connect"

## 📊 **Step 6: Verify Connection**

### **Test the connection:**
```bash
node test-server.js
```

### **Check health endpoint:**
Visit: `http://localhost:5000/api/health`

## 🛠️ **Step 7: Start EARNLANG**

```bash
npm start
```

## 🔒 **Security Best Practices**

### **Password Security:**
- Use a strong, unique password for your Atlas database
- Never commit the `.env` file to version control
- Use environment variables in production

### **Network Access:**
- In Atlas, go to "Network Access"
- Add your IP address or use `0.0.0.0/0` for development
- For production, restrict to your server IP

### **Database User:**
- Create a dedicated user for EARNLANG
- Use the principle of least privilege
- Regularly rotate passwords

## 📋 **Atlas Collections**

Your EARNLANG database will have these collections:

### **users**
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "string (hashed)",
  "points": "number",
  "totalPointsEarned": "number",
  "isAdmin": "boolean",
  "isVerified": "boolean",
  "createdAt": "Date",
  "lastLogin": "Date"
}
```

### **tasks**
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "type": "string",
  "points": "number",
  "isActive": "boolean",
  "isRepeatable": "boolean",
  "createdAt": "Date"
}
```

### **taskcompletions**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "taskId": "ObjectId",
  "completedAt": "Date",
  "pointsEarned": "number"
}
```

### **payouts**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "amount": "number",
  "gcashNumber": "string",
  "status": "string",
  "requestedAt": "Date",
  "processedAt": "Date"
}
```

## 🔍 **Useful Atlas Queries**

### **Find All Users**
```javascript
db.users.find({})
```

### **Find Admin Users**
```javascript
db.users.find({ "isAdmin": true })
```

### **Find Users with High Points**
```javascript
db.users.find({ "points": { "$gt": 1000 } })
```

### **Find Pending Payouts**
```javascript
db.payouts.find({ "status": "pending" })
```

### **Get Task Completion Stats**
```javascript
db.taskcompletions.aggregate([
  {
    $group: {
      _id: "$taskId",
      completions: { $sum: 1 },
      totalPoints: { $sum: "$pointsEarned" }
    }
  }
])
```

## 🚨 **Troubleshooting**

### **Connection Issues**
- **Error**: "ECONNREFUSED"
  - **Solution**: Check your password in the connection string
  - **Solution**: Verify network access in Atlas

### **Authentication Error**
- **Error**: "Authentication failed"
  - **Solution**: Check username and password
  - **Solution**: Verify database user permissions

### **Network Access Error**
- **Error**: "Network access denied"
  - **Solution**: Add your IP to Atlas Network Access
  - **Solution**: Use `0.0.0.0/0` for development

### **Database Not Found**
- **Error**: "Database not found"
  - **Solution**: The database will be created automatically
  - **Solution**: Run `node setup.js` to initialize

## 📈 **Monitoring in Atlas**

### **Performance Monitoring**
- Monitor query performance in Atlas
- Set up alerts for slow queries
- Track connection usage

### **Backup & Recovery**
- Atlas provides automatic backups
- Set up point-in-time recovery
- Test restore procedures

### **Scaling**
- Atlas can scale automatically
- Monitor storage and compute usage
- Upgrade cluster size as needed

## 🎯 **Production Deployment**

### **Environment Variables**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://earnlang:PROD_PASSWORD@cluster0.0ku8feb.mongodb.net/earnlang
JWT_SECRET=very_long_random_secret_key
```

### **Security Checklist**
- [ ] Use strong passwords
- [ ] Enable network restrictions
- [ ] Set up database monitoring
- [ ] Configure backup retention
- [ ] Enable audit logging

---

**🎮 EARNLANG + MongoDB Atlas = Scalable & Reliable!** 