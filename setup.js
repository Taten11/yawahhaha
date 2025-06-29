// Setup script for EARNLANG platform
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Task = require('./models/Task');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/earnlang', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected for setup');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Create admin user
const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists');
            return existingAdmin;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@earnlang.com',
            password: hashedPassword,
            isAdmin: true,
            isVerified: true,
            points: 0
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
        console.log('📧 Email: admin@earnlang.com');
        console.log('🔑 Password: admin123');
        console.log('⚠️ Please change the admin password after first login!');
        
        return adminUser;
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    }
};

// Create default tasks
const createDefaultTasks = async () => {
    try {
        // Check if tasks already exist
        const existingTasks = await Task.countDocuments();
        if (existingTasks > 0) {
            console.log(`ℹ️ ${existingTasks} tasks already exist`);
            return;
        }

        const defaultTasks = [
            {
                title: 'Daily Login',
                description: 'Log in to the platform and earn points for being active',
                type: 'login',
                points: 10,
                isActive: true,
                isRepeatable: true,
                cooldownHours: 24
            },
            {
                title: 'Complete Your First Task',
                description: 'Complete any task to get started with earning points',
                type: 'custom',
                points: 50,
                isActive: true,
                isRepeatable: false
            },
            {
                title: 'Refer a Friend',
                description: 'Invite a friend to join EARNLANG and earn bonus points',
                type: 'referral',
                points: 100,
                isActive: true,
                isRepeatable: true
            },
            {
                title: 'Update Your Profile',
                description: 'Complete your profile information to earn points',
                type: 'custom',
                points: 25,
                isActive: true,
                isRepeatable: false
            },
            {
                title: 'Request Your First Payout',
                description: 'Request a GCash payout to cash out your earnings',
                type: 'custom',
                points: 75,
                isActive: true,
                isRepeatable: false
            },
            {
                title: 'Stay Active for 7 Days',
                description: 'Log in daily for 7 consecutive days',
                type: 'daily',
                points: 200,
                isActive: true,
                isRepeatable: true,
                cooldownHours: 168 // 7 days
            },
            {
                title: 'Complete 10 Tasks',
                description: 'Complete 10 different tasks to earn a bonus',
                type: 'custom',
                points: 150,
                isActive: true,
                isRepeatable: false
            },
            {
                title: 'Share on Social Media',
                description: 'Share EARNLANG on your social media accounts',
                type: 'custom',
                points: 30,
                isActive: true,
                isRepeatable: true,
                cooldownHours: 24
            }
        ];

        await Task.insertMany(defaultTasks);
        console.log(`✅ Created ${defaultTasks.length} default tasks`);
    } catch (error) {
        console.error('❌ Error creating default tasks:', error);
        throw error;
    }
};

// Create demo user (optional)
const createDemoUser = async () => {
    try {
        // Check if demo user already exists
        const existingDemo = await User.findOne({ email: 'demo@earnlang.com' });
        if (existingDemo) {
            console.log('ℹ️ Demo user already exists');
            return existingDemo;
        }

        // Create demo user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo123', salt);

        const demoUser = new User({
            username: 'demo_user',
            email: 'demo@earnlang.com',
            password: hashedPassword,
            isVerified: true,
            points: 500,
            totalPointsEarned: 500
        });

        await demoUser.save();
        console.log('✅ Demo user created successfully');
        console.log('📧 Email: demo@earnlang.com');
        console.log('🔑 Password: demo123');
        
        return demoUser;
    } catch (error) {
        console.error('❌ Error creating demo user:', error);
        throw error;
    }
};

// Main setup function
const setup = async () => {
    console.log('🚀 Starting EARNLANG platform setup...\n');
    
    try {
        // Connect to database
        await connectDB();
        
        // Create admin user
        await createAdminUser();
        
        // Create default tasks
        await createDefaultTasks();
        
        // Create demo user
        await createDemoUser();
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Access the platform: http://localhost:5000');
        console.log('3. Login as admin: admin@earnlang.com / admin123');
        console.log('4. Login as demo user: demo@earnlang.com / demo123');
        console.log('5. Change default passwords for security');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run setup if this file is executed directly
if (require.main === module) {
    setup();
}

module.exports = { setup }; 