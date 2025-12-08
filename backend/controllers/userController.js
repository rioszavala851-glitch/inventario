const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Por favor completa todos los campos requeridos' });
        }

        // Validate role
        const allowedRoles = ['administrativo', 'almacen', 'cocina', 'ensalada', 'isla'];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Rol inválido. Roles permitidos: administrativo, almacen, cocina, ensalada, isla' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }

        // Hashes password in pre-save middleware in User model
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'almacen'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Error del servidor al crear usuario',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    createUser,
    deleteUser
};
