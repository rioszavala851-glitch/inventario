const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Find the administrativo role
        const adminRole = await db.collection('roles').findOne({ name: 'administrativo' });

        if (!adminRole) {
            console.log('❌ Role "administrativo" not found!');
            console.log('Please run: node scripts/seedRoles.js first');
            process.exit(1);
        }

        console.log(`✅ Found role "administrativo": ${adminRole._id}\n`);

        // Find the admin user
        const adminUser = await db.collection('users').findOne({ email: 'admin@admin.com' });

        if (!adminUser) {
            console.log('❌ User admin@admin.com not found!');
            process.exit(1);
        }

        console.log('📊 Current admin user:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Role (current): ${adminUser.role}`);
        console.log(`   Role type: ${typeof adminUser.role}\n`);

        // Update the user's role to ObjectId
        const result = await db.collection('users').updateOne(
            { email: 'admin@admin.com' },
            { $set: { role: adminRole._id } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ User updated successfully!');
            console.log(`   New role ObjectId: ${adminRole._id}\n`);
        } else {
            console.log('⚠️  User was not modified (may already have correct role)\n');
        }

        // Verify the update
        const updatedUser = await db.collection('users').findOne({ email: 'admin@admin.com' });
        console.log('📊 Updated admin user:');
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log(`   Role type: ${typeof updatedUser.role}`);
        console.log(`   Is ObjectId: ${updatedUser.role instanceof mongoose.Types.ObjectId || updatedUser.role.constructor.name === 'ObjectId'}\n`);

        console.log('✅ Done! Now logout and login again to see the menu items.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAdminUser();
