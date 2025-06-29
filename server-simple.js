const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage (for testing without MongoDB)
const users = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@earnlang.com',
        password: 'admin123',
        isAdmin: true,
        isVerified: true,
        points: 1000,
        totalPointsEarned: 1000
    },
    {
        id: '2',
        username: 'demo_user',
        email: 'demo@earnlang.com',
        password: 'demo123',
        isAdmin: false,
        isVerified: true,
        points: 500,
        totalPointsEarned: 500
    }
];

const tasks = [
    {
        id: '1',
        title: 'Daily Login',
        description: 'Log in to the platform and earn points',
        type: 'login',
        points: 10,
        isActive: true,
        isRepeatable: true
    },
    {
        id: '2',
        title: 'Complete Your First Task',
        description: 'Complete any task to get started',
        type: 'custom',
        points: 50,
        isActive: true,
        isRepeatable: false
    },
    {
        id: '3',
        title: 'Refer a Friend',
        description: 'Invite a friend to join EARNLANG',
        type: 'referral',
        points: 100,
        isActive: true,
        isRepeatable: true
    }
];

// Simple authentication middleware
const simpleAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    // Simple token validation (in real app, use JWT)
    const userId = token;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = { userId: user.id };
    req.userData = user;
    next();
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'EARNLANG Simple Server Running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    res.json({
        message: 'Login successful',
        token: user.id, // Simple token
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            points: user.points,
            isAdmin: user.isAdmin
        }
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        isAdmin: false,
        isVerified: true,
        points: 0,
        totalPointsEarned: 0
    };
    
    users.push(newUser);
    
    res.status(201).json({
        message: 'Registration successful!',
        token: newUser.id,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            isVerified: newUser.isVerified,
            points: newUser.points
        }
    });
});

app.get('/api/auth/me', simpleAuth, (req, res) => {
    res.json(req.userData);
});

// Task routes
app.get('/api/tasks', simpleAuth, (req, res) => {
    res.json(tasks.filter(task => task.isActive));
});

app.post('/api/tasks/complete/:taskId', simpleAuth, (req, res) => {
    const task = tasks.find(t => t.id === req.params.taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    const user = req.userData;
    user.points += task.points;
    user.totalPointsEarned += task.points;
    
    res.json({
        message: 'Task completed successfully!',
        pointsEarned: task.points,
        newBalance: user.points
    });
});

app.get('/api/tasks/stats', simpleAuth, (req, res) => {
    res.json({
        totalCompletions: 5,
        totalPointsEarned: req.userData.totalPointsEarned,
        todayCompletions: 2
    });
});

// User routes
app.get('/api/user/profile', simpleAuth, (req, res) => {
    res.json({
        user: req.userData,
        taskHistory: [],
        payoutHistory: []
    });
});

app.get('/api/user/stats', simpleAuth, (req, res) => {
    res.json({
        taskStats: { totalTasks: 5, totalPoints: req.userData.totalPointsEarned },
        payoutStats: [],
        recentActivity: []
    });
});

app.get('/api/user/referral', simpleAuth, (req, res) => {
    res.json({
        referralCode: 'DEMO123',
        referralCount: 0,
        referredBy: null,
        referredUsers: []
    });
});

// Payout routes
app.post('/api/payouts/request', simpleAuth, (req, res) => {
    const { gcashNumber, amount } = req.body;
    const pointsRequired = amount * 10;
    
    if (req.userData.points < pointsRequired) {
        return res.status(400).json({ message: 'Insufficient points' });
    }
    
    req.userData.points -= pointsRequired;
    
    res.status(201).json({
        message: 'Payout request submitted successfully',
        payout: {
            id: Date.now().toString(),
            amount,
            pointsUsed: pointsRequired,
            status: 'pending',
            requestedAt: new Date()
        }
    });
});

app.get('/api/payouts/history', simpleAuth, (req, res) => {
    res.json([]);
});

app.get('/api/payouts/stats', simpleAuth, (req, res) => {
    res.json({
        byStatus: [],
        totalRequested: 0,
        totalCompleted: 0
    });
});

// Admin routes
app.get('/api/admin/dashboard-stats', simpleAuth, (req, res) => {
    if (!req.userData.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    
    res.json({
        totalUsers: users.length,
        activeTasks: tasks.filter(t => t.isActive).length,
        pendingPayouts: 0,
        totalPoints: users.reduce((sum, u) => sum + u.points, 0),
        todayCompletions: 5,
        todayPayouts: 0
    });
});

app.get('/api/admin/users', simpleAuth, (req, res) => {
    if (!req.userData.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    
    const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        isVerified: u.isVerified,
        isBanned: false,
        points: u.points,
        totalPointsEarned: u.totalPointsEarned,
        createdAt: new Date(),
        lastLogin: new Date()
    }));
    
    res.json({
        users: safeUsers,
        pagination: {
            page: 1,
            limit: 20,
            total: safeUsers.length,
            pages: 1
        }
    });
});

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/payout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payout.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin-dashboard.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🎮 EARNLANG Simple Server running on port ${PORT}`);
    console.log(`🌐 Main Site: http://localhost:${PORT}`);
    console.log(`🛠️ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📧 Admin Login: admin@earnlang.com / admin123`);
    console.log(`📧 Demo Login: demo@earnlang.com / demo123`);
    console.log(`⚠️ This is a simple version without MongoDB - data will reset on restart`);
}); 