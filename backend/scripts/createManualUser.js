const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');

dotenv.config();

const createManualUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const roleName = 'cocina';
        const role = await Role.findOne({ name: roleName });

        if (!role) {
            console.error(`Error: Role '${roleName}' not found.`);
            const allRoles = await Role.find({});
            console.log('Available roles:', allRoles.map(r => r.name));
            process.exit(1);
        }

        const email = 'cocina@test.com';
        const password = '123456'; // Default password

        // Check if exists
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('User already exists. Deleting to recreate...');
            await User.deleteOne({ email });
        }

        // Create user
        // Note: User model has pre-save hook for password hashing, 
        // but we need to ensure the role is set as ObjectId
        const user = new User({
            name: 'Manuel',
            email: email,
            password: password,
            role: role._id
        });

        await user.save();

        console.log('-----------------------------------');
        console.log('✅ Usuario creado manualmente con éxito');
        console.log('👤 Nombre: Manuel');
        console.log('📧 Email: cocina@test.com');
        console.log('🔑 Password: 123456');
        console.log('🛠 Rol: Cocina');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
};

createManualUser();
