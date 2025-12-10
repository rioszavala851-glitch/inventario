const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Activity = require('../models/Activity');
const User = require('../models/User');

dotenv.config();

const seedActivity = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find a user to attribute activity to
        const user = await User.findOne();
        const userId = user ? user._id : null;

        console.log(`Creating activities for user: ${userId || 'Anonymous'}`);

        await Activity.deleteMany({}); // Optional: clear old activities
        console.log('Old activities cleared.');

        const activities = [
            {
                user: userId,
                action: 'UPDATE',
                description: 'Actualización de Inventario: Almacén',
                details: {
                    area: 'Almacén',
                    itemCount: 5,
                    totalValue: 1250.50
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
            },
            {
                user: userId,
                action: 'UPDATE',
                description: 'Actualización de Inventario: Cocina',
                details: {
                    area: 'Cocina',
                    itemCount: 12,
                    totalValue: 3400.00
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                user: userId,
                action: 'SNAPSHOT',
                description: 'Cierre de Inventario Diario',
                details: {
                    itemCount: 45,
                    totalValue: 15600.75
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                user: userId,
                action: 'UPDATE',
                description: 'Recepción de Mercancia: Proveedor A',
                details: {
                    area: 'Almacén',
                    itemCount: 20,
                    totalValue: 5000.00
                },
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) // 1 day, 2 hours ago
            }
        ];

        await Activity.insertMany(activities);

        console.log('Activities Seeded!');
        process.exit();
    } catch (error) {
        console.error('Error seeding activities:', error);
        process.exit(1);
    }
};

seedActivity();
