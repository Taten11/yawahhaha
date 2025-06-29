const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const Payout = require('../models/Payout');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin authentication to all admin routes
router.use(auth);
router.use(adminAuth);

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
    try {
        const [
            totalUsers,
            activeTasks,
            pendingPayouts,
            totalPoints,
            todayCompletions,
            todayPayouts
        ] = await Promise.all([
            User.countDocuments(),
            Task.countDocuments({ isActive: true }),
            Payout.countDocuments({ status: 'pending' }),
            User.aggregate([
                { $group: { _id: null, total: { $sum: '$points' } } }
            ]),
            TaskCompletion.countDocuments({
                completedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            }),
            Payout.countDocuments({
                requestedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            })
        ]);

        res.json({
            totalUsers,
            activeTasks,
            pendingPayouts,
            totalPoints: totalPoints[0]?.total || 0,
            todayCompletions,
            todayPayouts
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const activity = await TaskCompletion.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort({ completedAt: -1 })
            .limit(limit);

        const formattedActivity = activity.map(item => ({
            type: 'task_complete',
            title: `${item.userId.username} completed a task`,
            description: `Completed "${item.taskId.title}" for ${item.pointsEarned} points`,
            timestamp: item.completedAt
        }));

        res.json(formattedActivity);

    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const status = req.query.status || '';

        const query = {};
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            if (status === 'banned') {
                query.isBanned = true;
            } else if (status === 'active') {
                query.isBanned = false;
            }
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's task completions
        const taskCompletions = await TaskCompletion.find({ userId: user._id })
            .sort({ completedAt: -1 })
            .limit(20);

        // Get user's payouts
        const payouts = await Payout.find({ userId: user._id })
            .sort({ requestedAt: -1 })
            .limit(10);

        res.json({
            user,
            taskCompletions,
            payouts
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user
router.put('/users/:userId', async (req, res) => {
    try {
        const { username, email, points, isBanned, isAdmin } = req.body;
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (points !== undefined) user.points = points;
        if (isBanned !== undefined) user.isBanned = isBanned;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                points: user.points,
                isBanned: user.isBanned,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new task
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, type, points, isActive, isRepeatable, cooldownHours } = req.body;

        if (!title || !description || !points) {
            return res.status(400).json({ message: 'Title, description, and points are required' });
        }

        const task = new Task({
            title,
            description,
            type: type || 'custom',
            points,
            isActive: isActive !== undefined ? isActive : true,
            isRepeatable: isRepeatable || false,
            cooldownHours: cooldownHours || 0,
            createdBy: req.user.username
        });

        await task.save();

        res.status(201).json({
            message: 'Task created successfully',
            task
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/tasks/:taskId', async (req, res) => {
    try {
        const { title, description, type, points, isActive, isRepeatable, cooldownHours } = req.body;
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update fields
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (type !== undefined) task.type = type;
        if (points !== undefined) task.points = points;
        if (isActive !== undefined) task.isActive = isActive;
        if (isRepeatable !== undefined) task.isRepeatable = isRepeatable;
        if (cooldownHours !== undefined) task.cooldownHours = cooldownHours;

        await task.save();

        res.json({
            message: 'Task updated successfully',
            task
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/tasks/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await Task.findByIdAndDelete(taskId);

        res.json({ message: 'Task deleted successfully' });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all payouts
router.get('/payouts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || '';

        const query = {};
        if (status) {
            query.status = status;
        }

        const payouts = await Payout.find(query)
            .populate('userId', 'username email')
            .sort({ requestedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Payout.countDocuments(query);

        res.json({
            payouts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve payout
router.post('/payouts/:payoutId/approve', async (req, res) => {
    try {
        const { notes } = req.body;
        const payoutId = req.params.payoutId;

        const payout = await Payout.findById(payoutId);
        if (!payout) {
            return res.status(404).json({ message: 'Payout not found' });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({ message: 'Payout is not pending' });
        }

        payout.status = 'completed';
        payout.processedAt = new Date();
        payout.processedBy = req.user.username;
        payout.notes = notes;

        await payout.save();

        res.json({
            message: 'Payout approved successfully',
            payout
        });

    } catch (error) {
        console.error('Approve payout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject payout
router.post('/payouts/:payoutId/reject', async (req, res) => {
    try {
        const { notes } = req.body;
        const payoutId = req.params.payoutId;

        const payout = await Payout.findById(payoutId);
        if (!payout) {
            return res.status(404).json({ message: 'Payout not found' });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({ message: 'Payout is not pending' });
        }

        // Refund points to user
        const user = await User.findById(payout.userId);
        if (user) {
            user.points += payout.pointsUsed;
            await user.save();
        }

        payout.status = 'rejected';
        payout.processedAt = new Date();
        payout.processedBy = req.user.username;
        payout.notes = notes;

        await payout.save();

        res.json({
            message: 'Payout rejected and points refunded',
            payout
        });

    } catch (error) {
        console.error('Reject payout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get platform statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            verifiedUsers,
            bannedUsers,
            totalTasks,
            activeTasks,
            totalCompletions,
            totalPayouts,
            pendingPayouts,
            completedPayouts,
            totalPointsEarned,
            totalPointsPaid
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ isBanned: true }),
            Task.countDocuments(),
            Task.countDocuments({ isActive: true }),
            TaskCompletion.countDocuments(),
            Payout.countDocuments(),
            Payout.countDocuments({ status: 'pending' }),
            Payout.countDocuments({ status: 'completed' }),
            User.aggregate([
                { $group: { _id: null, total: { $sum: '$totalPointsEarned' } } }
            ]),
            Payout.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                banned: bannedUsers
            },
            tasks: {
                total: totalTasks,
                active: activeTasks,
                completions: totalCompletions
            },
            payouts: {
                total: totalPayouts,
                pending: pendingPayouts,
                completed: completedPayouts
            },
            points: {
                earned: totalPointsEarned[0]?.total || 0,
                paid: totalPointsPaid[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 