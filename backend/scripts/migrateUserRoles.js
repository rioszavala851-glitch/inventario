const mongoose = require('mongoose');
require('dotenv').config();

async function migrateRoles() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Get all roles
        const roles = await db.collection('roles').find({}).toArray();
        console.log('\nRoles found:');
        roles.forEach(role => {
            console.log(`  - ${role.name}: ${role._id}`);
        });

        // Get all users
        const users = await db.collection('users').find({}).toArray();
        console.log(`\nFound ${users.length} users`);

        let updated = 0;
        for (const user of users) {
            // Check if role is a string
            if (typeof user.role === 'string') {
                console.log(`\nUser: ${user.email}`);
                console.log(`  Current role (string): ${user.role}`);

                // Find matching role
                const matchingRole = roles.find(r => r.name === user.role);

                if (matchingRole) {
                    // Update user with ObjectId
                    await db.collection('users').updateOne(
                        { _id: user._id },
                        { $set: { role: matchingRole._id } }
                    );
                    console.log(`  ✅ Updated to ObjectId: ${matchingRole._id}`);
                    updated++;
                } else {
                    console.log(`  ❌ No matching role found for: ${user.role}`);
                }
            } else {
                console.log(`\n${user.email}: Already has ObjectId role`);
            }
        }

        console.log(`\n✅ Migration complete! Updated ${updated} users`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

migrateRoles();
