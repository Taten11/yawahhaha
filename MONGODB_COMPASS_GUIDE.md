# 🗄️ MongoDB Compass Setup for EARNLANG

## 📥 **Step 1: Download MongoDB Compass**

1. **Visit**: https://www.mongodb.com/try/download/compass
2. **Select**: Community Edition (Free)
3. **Choose**: Your operating system (Windows/macOS/Linux)
4. **Download** and install

## 🔗 **Step 2: Connect to EARNLANG Database**

### **Connection String:**
```mongodb://localhost:27017/earnlang
```

### **Connection Steps:**
1. Open MongoDB Compass
2. Click "New Connection"
3. Paste the connection string above
4. Click "Connect"

## 📋 **Step 3: Explore EARNLANG Collections**

### **Users Collection**
- **Purpose**: Store user accounts and profiles
- **Key Fields**:
  - `username` - User's display name
  - `email` - User's email address
  - `points` - Current point balance
  - `totalPointsEarned` - Lifetime points earned
  - `isAdmin` - Admin privileges (true/false)
  - `isVerified` - Email verification status

### **Tasks Collection**
- **Purpose**: Available tasks for users to complete
- **Key Fields**:
  - `title` - Task name
  - `description` - Task details
  - `type` - Task category (login, referral, custom)
  - `points` - Points awarded for completion
  - `isActive` - Whether task is available
  - `isRepeatable` - Can be completed multiple times

### **TaskCompletions Collection**
- **Purpose**: Track when users complete tasks
- **Key Fields**:
  - `userId` - Reference to user
  - `taskId` - Reference to task
  - `completedAt` - Timestamp of completion
  - `pointsEarned` - Points awarded

### **Payouts Collection**
- **Purpose**: GCash withdrawal requests
- **Key Fields**:
  - `userId` - User requesting payout
  - `amount` - Peso amount requested
  - `gcashNumber` - GCash number
  - `status` - pending/approved/rejected
  - `requestedAt` - Request timestamp

## 🔍 **Step 4: Common Queries**

### **Find All Users**
```javascript
{}
```

### **Find Admin Users**
```javascript
{ "isAdmin": true }
```

### **Find Users with High Points**
```javascript
{ "points": { "$gt": 1000 } }
```

### **Find Active Tasks**
```javascript
{ "isActive": true }
```

### **Find Pending Payouts**
```javascript
{ "status": "pending" }
```

## 📊 **Step 5: Data Management**

### **Add New User (Manual)**
1. Click on `users` collection
2. Click "Add Data" → "Insert Document"
3. Add JSON:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "hashedpassword",
  "points": 0,
  "totalPointsEarned": 0,
  "isAdmin": false,
  "isVerified": true,
  "createdAt": new Date()
}
```

### **Update User Points**
1. Find the user document
2. Click "Edit Document"
3. Update the `points` field
4. Click "Update"

### **Add New Task**
1. Click on `tasks` collection
2. Click "Add Data" → "Insert Document"
3. Add JSON:
```json
{
  "title": "New Task",
  "description": "Complete this task to earn points",
  "type": "custom",
  "points": 50,
  "isActive": true,
  "isRepeatable": false,
  "createdAt": new Date()
}
```

## 🛠️ **Step 6: Troubleshooting**

### **Connection Issues**
- **Error**: "ECONNREFUSED"
  - **Solution**: Make sure MongoDB is running
  - **Command**: `net start MongoDB` (Windows)

### **Database Not Found**
- **Error**: "Database not found"
  - **Solution**: The database will be created automatically when EARNLANG first runs

### **Permission Issues**
- **Error**: "Access denied"
  - **Solution**: Make sure MongoDB is running without authentication

## 📈 **Step 7: Monitoring & Analytics**

### **User Statistics**
- Total users: Count documents in `users` collection
- Active users: Count users with recent activity
- Points distribution: Use aggregation to see point ranges

### **Task Performance**
- Most completed tasks: Group by `taskId` in `taskcompletions`
- Daily completions: Filter by date in `completedAt`

### **Payout Analysis**
- Pending payouts: Count documents with `status: "pending"`
- Total payout amount: Sum `amount` field

## 🔒 **Security Notes**

- **Local Development**: This setup is for local development only
- **Production**: Use MongoDB Atlas with proper authentication
- **Backup**: Regularly export your data using Compass export feature
- **Access Control**: In production, use MongoDB users and roles

## 📚 **Useful Compass Features**

### **Schema Analysis**
- Click on collection → "Schema" tab
- See field types and data distribution

### **Performance**
- Click on collection → "Performance" tab
- Monitor query performance

### **Validation**
- Click on collection → "Validation" tab
- Set up data validation rules

### **Indexes**
- Click on collection → "Indexes" tab
- Create indexes for better performance

---

**🎮 EARNLANG + MongoDB Compass = Perfect Data Management!** 