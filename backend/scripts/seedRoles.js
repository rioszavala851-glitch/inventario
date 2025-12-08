const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

const seedRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Define system roles
        const systemRoles = [
            {
                name: 'administrativo',
                displayName: 'Administrativo',
                permissions: ['view_dashboard', 'manage_ingredients', 'capture_inventory', 'view_history', 'manage_users', 'manage_roles', 'view_reports'],
                color: '#8b5cf6',
                icon: 'ShieldCheck',
                isSystem: true
            },
            {
                name: 'almacen',
                displayName: 'Almacén',
                permissions: ['view_dashboard', 'capture_inventory'],
                color: '#6366f1',
                icon: 'Archive',
                isSystem: true
            },
            {
                name: 'cocina',
                displayName: 'Cocina',
                permissions: ['view_dashboard', 'capture_inventory'],
                color: '#8b5cf6',
                icon: 'ChefHat',
                isSystem: true
            },
            {
                name: 'ensalada',
                displayName: 'Ensalada',
                permissions: ['view_dashboard', 'capture_inventory'],
                color: '#ec4899',
                icon: 'Salad',
                isSystem: true
            },
            {
                name: 'isla',
                displayName: 'Isla',
                permissions: ['view_dashboard', 'capture_inventory'],
                color: '#f43f5e',
                icon: 'Utensils',
                isSystem: true
            }
        ];

        console.log('🌱 Seeding roles...');

        // Create or update roles
        for (const roleData of systemRoles) {
            const existingRole = await Role.findOne({ name: roleData.name });

            if (existingRole) {
                console.log(`  ⚠️  Role "${roleData.name}" already exists, updating...`);
                await Role.findByIdAndUpdate(existingRole._id, roleData);
            } else {
                console.log(`  ✅ Creating role "${roleData.name}"`);
                await Role.create(roleData);
            }
        }

        console.log('✅ Roles seeded successfully');

        // Optional: Migrate existing users to reference roles
        console.log('🔄 Migrating existing users...');

        const users = await User.find({});
        let migratedCount = 0;

        for (const user of users) {
            // Check if user.role is a string (old format)
            if (typeof user.role === 'string') {
                const role = await Role.findOne({ name: user.role.toLowerCase() });

                if (role) {
                    user.role = role._id;
                    await user.save();
                    migratedCount++;
                    console.log(`  ✅ Migrated user "${user.name}" to role "${role.name}"`);
                } else {
                    console.log(`  ⚠️  No matching role found for user "${user.name}" with role "${user.role}"`);
                }
            }
        }

        console.log(`✅ Migrated ${migratedCount} users`);
        console.log('🎉 Seed completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
