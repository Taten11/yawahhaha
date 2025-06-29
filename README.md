# 🎮 EARNLANG - Task-Based Earning Game

A complete rewards-based earning platform where users complete tasks to earn points and cash out via GCash.

**Current Version: v1.1.0** - Enhanced Security & Performance

## ✨ Features

### 🔐 User Features
- **Secure Authentication**: Login/signup with email verification
- **Task Dashboard**: Complete various tasks to earn points
- **Points System**: Earn points for completing tasks (10 points = ₱1)
- **Profile Management**: View stats, task history, and manage account
- **GCash Payouts**: Request withdrawals with minimum ₱50 payout
- **Referral System**: Earn bonus points by referring friends

### 🛠️ Admin Features
- **Admin Panel**: Secure admin dashboard with password protection
- **Task Management**: Create, edit, and manage tasks
- **User Management**: View user data, ban users, adjust points
- **Payout Management**: Approve/reject GCash withdrawal requests
- **Reports & Analytics**: View platform statistics and export data
- **System Settings**: Configure platform settings and maintenance mode

### 🔒 Security Features (v1.1.0)
- **Helmet.js**: Enhanced security headers
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Graceful Shutdown**: Proper cleanup on server termination

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher) - Updated requirement
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd earnlang
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/earnlang
   JWT_SECRET=your_jwt_secret_here
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   npm start
   ```

6. **Access the platform**
   - Main Site: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin
   - Health Check: http://localhost:5000/api/health

## 🔄 Updating

### Automatic Update
```bash
# Run the update script
./update.bat
```

### Manual Update
```bash
# Update dependencies
npm update

# Run security audit
npm audit fix

# Restart the server
npm start
```

## 📁 Project Structure

```
earnlang/
├── public/                    # Frontend files
│   ├── index.html            # Login page
│   ├── signup.html           # Registration page
│   ├── verify.html           # Email verification
│   ├── dashboard.html        # User task dashboard
│   ├── profile.html          # User profile
│   ├── payout.html           # GCash payout page
│   ├── css/
│   │   └── style.css         # Main styles
│   ├── js/
│   │   ├── utils.js          # Common utilities
│   │   ├── auth.js           # Authentication
│   │   ├── dashboard.js      # Task dashboard
│   │   ├── profile.js        # Profile management
│   │   └── payout.js         # Payout handling
│   └── admin/                # Admin panel
│       ├── admin-login.html  # Admin login
│       ├── admin-dashboard.html
│       ├── admin.css         # Admin styles
│       └── admin.js          # Admin functionality
├── models/                   # Database models
│   ├── User.js
│   ├── Task.js
│   ├── TaskCompletion.js
│   └── Payout.js
├── routes/                   # API routes
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── userRoutes.js
│   ├── payoutRoutes.js
│   └── adminRoutes.js
├── middleware/               # Middleware
│   └── auth.js
├── server.js                 # Main server file (v1.1.0)
├── server-simple.js          # Simple version (no MongoDB)
├── package.json              # Dependencies (v1.1.0)
├── update.bat               # Update script
├── launch.bat               # Launch script
└── README.md
```

## 🎯 Task Types

### Available Task Categories
- **Login Tasks**: Daily login rewards
- **Referral Tasks**: Earn points by referring friends
- **Daily Tasks**: Repeatable daily missions
- **Custom Tasks**: Admin-created special tasks

### Task Features
- Point rewards (1-1000 points per task)
- Repeatable or one-time completion
- Cooldown periods for repeatable tasks
- Requirements (minimum points, level, etc.)

## 💰 Payout System

### GCash Withdrawal
- **Minimum**: ₱50 (500 points)
- **Maximum**: ₱10,000 per request
- **Processing**: 24-48 hours
- **Exchange Rate**: 10 points = ₱1

### Payout Status
- **Pending**: Awaiting admin approval
- **Approved**: Payment sent to GCash
- **Rejected**: Request denied
- **Completed**: Successfully paid out

## 🔧 Configuration

### Environment Variables
```env
PORT=5000                          # Server port
MONGO_URI=mongodb://localhost:27017/earnlang
JWT_SECRET=your_secret_key         # JWT signing secret
EMAIL_SERVICE=gmail                # Email service provider
EMAIL_USER=your_email@gmail.com    # Email for notifications
EMAIL_PASS=your_email_password     # Email password
NODE_ENV=development               # Environment mode
```

### Database Setup
The application will automatically create the necessary collections:
- `users` - User accounts and profiles
- `tasks` - Available tasks
- `taskcompletions` - Task completion history
- `payouts` - Payout requests and history

## 🛡️ Security Features (v1.1.0)

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Admin Protection**: Admin-only routes and functions
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin request protection
- **Helmet.js**: Security headers and protection
- **Rate Limiting**: Brute force attack prevention
- **Graceful Shutdown**: Proper cleanup on termination

## 📊 Admin Panel

### Dashboard Features
- Real-time platform statistics
- Recent user activity
- System status monitoring
- Quick action buttons
- Health check information

### User Management
- View all user accounts
- Ban/unban users
- Adjust user points
- View user activity history

### Task Management
- Create new tasks
- Edit existing tasks
- Enable/disable tasks
- Set point rewards and requirements

### Payout Management
- Review pending payouts
- Approve or reject requests
- Add notes to decisions
- View payout history

## 🚀 Deployment

### Production Setup
```bash
# Set environment
export NODE_ENV=production

# Install dependencies
npm install --production

# Start server
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔄 Version History

### v1.1.0 (Current)
- ✅ Enhanced security with Helmet.js
- ✅ Rate limiting for API protection
- ✅ Better error handling and logging
- ✅ Health check endpoint
- ✅ Graceful shutdown handling
- ✅ Updated dependencies
- ✅ Improved CORS configuration

### v1.0.0
- ✅ Initial release
- ✅ Basic authentication system
- ✅ Task management
- ✅ Points system
- ✅ GCash payout integration
- ✅ Admin panel

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **Port Already in Use**: Change PORT in .env file
3. **Authentication Issues**: Check JWT_SECRET in .env
4. **Email Not Working**: Verify email credentials

### Getting Help
- Check `TROUBLESHOOTING.md` for detailed solutions
- Run health check: `http://localhost:5000/api/health`
- Check server logs for error details

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**EARNLANG v1.1.0** - Enhanced Security & Performance 