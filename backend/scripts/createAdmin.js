const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');

dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Find the administrativo role
        const adminRole = await Role.findOne({ name: 'administrativo' });

        if (!adminRole) {
            console.error('❌ Administrativo role not found. Please run seedRoles.js first.');
            process.exit(1);
        }

        // Check if admin user already exists
        const existingUser = await User.findOne({ email: 'admin@admin.com' });

        if (existingUser) {
            console.log('⚠️  User admin@admin.com already exists.');
            console.log('   Updating role to administrativo...');
            existingUser.role = adminRole._id;
            await existingUser.save();
            console.log('✅ User updated successfully!');
        } else {
            // Create new admin user
            const user = await User.create({
                name: 'Administrador',
                email: 'admin@admin.com',
                password: 'admin1234',
                role: adminRole._id,
            });
            console.log('✅ Admin user created successfully!');
            console.log('   Email: admin@admin.com');
            console.log('   Password: admin1234');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
