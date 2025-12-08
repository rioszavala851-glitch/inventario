const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        const userExists = await User.findOne({ email: 'admin@admin.com' });

        if (userExists) {
            console.log('User admin@admin.com already exists.');
        } else {
            const user = await User.create({
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin1234',
                role: 'admin',
            });
            console.log('User admin@admin.com created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
