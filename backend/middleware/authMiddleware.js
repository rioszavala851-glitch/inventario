const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            console.log('🔐 Token received, verifying...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified, user ID:', decoded.id);

            // Get user from token (exclude password) and populate role
            req.user = await User.findById(decoded.id).select('-password').populate('role');

            if (!req.user) {
                console.log('❌ User not found in database');
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            console.log('✅ User found:', req.user.name, 'Role:', req.user.role?.name || req.user.role);
            return next();
        } catch (error) {
            console.error('❌ Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('❌ No token provided in request');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Check if user has admin role
// Support both 'admin' (old) and 'administrativo' (new) for backward compatibility
const isAdmin = (req, res, next) => {
    // Check if role is populated object or string
    const roleName = req.user?.role?.name || req.user?.role;

    console.log('🔒 Auth Check - isAdmin');
    console.log('User ID:', req.user?._id);
    console.log('User Name:', req.user?.name);
    console.log('Role Raw:', req.user?.role);
    console.log('Role Name Resolved:', roleName);

    if (roleName === 'administrativo' || roleName === 'admin') {
        next();
    } else {
        console.log('❌ Access Denied: Admin privileges required');
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

// Check if user has specific role(s)
const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const userRole = req.user.role?.name || req.user.role;

        if (roles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
    };
};

module.exports = { protect, isAdmin, hasRole };
