const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const verifyUser = async () => {
    try {
        await connectDB();

        const email = 'admin@admin.com';
        const password = 'admin1234';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT found!');
        } else {
            console.log(`User found: ${user.email}`);
            console.log(`Stored Hashed Password: ${user.password}`);

            const isMatch = await user.matchPassword(password);
            console.log(`Password match result for '${password}': ${isMatch}`);
        }

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

verifyUser();
