const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Check if user has admin role
// Support both 'admin' (old) and 'administrativo' (new) for backward compatibility
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'administrativo' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

// Check if user has specific role(s)
const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
    };
};

module.exports = { protect, isAdmin, hasRole };
