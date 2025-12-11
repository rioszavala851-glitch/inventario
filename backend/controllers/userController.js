const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').populate('role', 'name');
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

        // Find the role by name
        const Role = require('../models/Role');
        const roleName = role || 'almacen';
        const roleDoc = await Role.findOne({ name: roleName });

        if (!roleDoc) {
            return res.status(400).json({ message: `Rol '${roleName}' no encontrado. Asegúrate de que los roles estén inicializados.` });
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
            role: roleDoc._id
        });

        if (user) {
            await user.populate('role', 'name');

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role?.name || 'unknown'
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

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { name, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Este correo ya está registrado' });
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Se requiere la contraseña actual y la nueva' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña' });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { name, email, role, isActive } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (isActive !== undefined) user.isActive = isActive;

        if (role) {
            const Role = require('../models/Role');
            const roleDoc = await Role.findOne({ name: role });
            if (roleDoc) {
                user.role = roleDoc._id;
            }
        }

        await user.save();
        await user.populate('role', 'name');

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name,
            isActive: user.isActive
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

module.exports = {
    getUsers,
    createUser,
    deleteUser,
    updateProfile,
    changePassword,
    updateUser
};
