const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('role', 'name');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name || user.role, // Return role name if populated, otherwise role ID
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only later)
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Find the role by name
    const Role = require('../models/Role');
    const roleName = role || 'almacen';
    const roleDoc = await Role.findOne({ name: roleName });

    if (!roleDoc) {
        return res.status(400).json({ message: `Role '${roleName}' not found. Please ensure roles are seeded.` });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: roleDoc._id, // Use the ObjectId of the role
    });

    if (user) {
        // Populate role to get the name
        await user.populate('role', 'name');

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name || 'unknown', // Return role name
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { authUser, registerUser };
