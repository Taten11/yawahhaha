const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        // Check if user exists and is admin
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Account is banned' });
        }

        // Add admin user to request
        req.adminUser = user;
        next();

    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = adminAuth; 