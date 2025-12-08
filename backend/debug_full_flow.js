const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const runDebug = async () => {
    try {
        // 1. Database Connection
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // 2. Ensure User Exists
        let user = await User.findOne({ email: 'admin@admin.com' });
        if (!user) {
            console.log('Creating missing admin user...');
            user = await User.create({
                name: 'Admin',
                email: 'admin@admin.com',
                password: 'admin1234',
                role: 'admin',
            });
        }
        console.log('User confirmed in DB:', user.email);

        // 3. Start Express Server
        const app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/api/auth', authRoutes);

        const PORT = 5002;
        const server = app.listen(PORT, async () => {
            console.log(`Debug Server running on port ${PORT}`);

            // 4. Test Login
            try {
                console.log('Sending login request...');
                const response = await fetch(`http://localhost:${PORT}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@admin.com',
                        password: 'admin1234'
                    })
                });

                console.log('Status Code:', response.status);

                const data = await response.json();

                if (response.ok) {
                    console.log('LOGIN SUCCESS!');
                    console.log('Token:', data.token ? 'Received' : 'Missing');
                    console.log('User:', data.email);
                } else {
                    console.log('LOGIN FAILED');
                    console.log('Message:', data.message);
                }

            } catch (err) {
                console.log('Request Error:', err.message);
            } finally {
                server.close();
                mongoose.connection.close();
                process.exit();
            }
        });

    } catch (error) {
        console.error('Debug Script Error:', error);
        process.exit(1);
    }
};

runDebug();
