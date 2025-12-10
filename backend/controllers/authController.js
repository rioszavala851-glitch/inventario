const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Token expiration: Use environment variable or default to 7 days
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
};

// Validation rules for login
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Por favor ingresa un correo electrónico válido')
        .normalizeEmail()
        .trim(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

// Validation rules for registration
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .escape(),
    body('email')
        .isEmail()
        .withMessage('Por favor ingresa un correo electrónico válido')
        .normalizeEmail()
        .trim(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número'),
    body('role')
        .optional()
        .trim()
        .escape()
];

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Datos inválidos',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user and explicitly select password (it's usually excluded)
        const user = await User.findOne({ email })
            .select('+password')
            .populate('role', 'name permissions');

        if (!user) {
            // Use same message to prevent user enumeration
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Check if user is active
        if (user.isActive === false) {
            return res.status(401).json({ message: 'Cuenta desactivada. Contacta al administrador.' });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Update last login timestamp (if you have this field)
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name || user.role,
            permissions: user.role?.permissions || [],
            token: generateToken(user._id),
            expiresIn: TOKEN_EXPIRY
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (should be protected in production)
const registerUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Datos inválidos',
                errors: errors.array()
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
        }

        // Find the role by name
        const Role = require('../models/Role');
        const roleName = role || 'almacen';
        const roleDoc = await Role.findOne({ name: roleName.toLowerCase() });

        if (!roleDoc) {
            return res.status(400).json({
                message: `El rol '${roleName}' no existe. Contacta al administrador.`
            });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: roleDoc._id,
        });

        if (user) {
            await user.populate('role', 'name permissions');

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role?.name || 'unknown',
                permissions: user.role?.permissions || [],
                token: generateToken(user._id),
                expiresIn: TOKEN_EXPIRY
            });
        } else {
            res.status(400).json({ message: 'Error al crear usuario' });
        }
    } catch (error) {
        console.error('Register error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
        }

        res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('role', 'name permissions');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role?.name,
            permissions: user.role?.permissions || []
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

module.exports = {
    authUser,
    registerUser,
    getMe,
    loginValidation,
    registerValidation
};
