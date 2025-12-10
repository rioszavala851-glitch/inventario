const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProduction = process.env.NODE_ENV === 'production';

// Helper for logging (only in development)
const devLog = (...args) => {
    if (!isProduction) {
        console.log(...args);
    }
};

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            devLog('🔐 Token received, verifying...');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            devLog('✅ Token verified, user ID:', decoded.id);

            // Check token expiration
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({ message: 'Token expirado, por favor inicia sesión de nuevo' });
            }

            // Get user from token (exclude password) and populate role
            req.user = await User.findById(decoded.id).select('-password').populate('role');

            if (!req.user) {
                devLog('❌ User not found in database');
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user is active (if you have this field)
            if (req.user.isActive === false) {
                return res.status(401).json({ message: 'Cuenta desactivada. Contacta al administrador.' });
            }

            devLog('✅ User authenticated:', req.user.name);
            return next();
        } catch (error) {
            devLog('❌ Token verification failed:', error.message);

            // Provide specific error messages
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado, por favor inicia sesión de nuevo' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token inválido' });
            }

            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        devLog('❌ No token provided in request');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Check if user has admin role
const isAdmin = (req, res, next) => {
    const roleName = req.user?.role?.name || req.user?.role;

    devLog('🔒 Auth Check - isAdmin, Role:', roleName);

    if (roleName === 'administrativo' || roleName === 'admin' || roleName === 'aux_administrativo') {
        next();
    } else {
        devLog('❌ Access Denied: Admin privileges required');
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
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
                message: `Acceso denegado. Rol requerido: ${roles.join(' o ')}`
            });
        }
    };
};

// Check if user has specific permission
const hasPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const userPermissions = req.user.role?.permissions || [];
        const hasRequired = permissions.some(perm => userPermissions.includes(perm));

        if (hasRequired) {
            next();
        } else {
            res.status(403).json({
                message: `Acceso denegado. Permiso requerido: ${permissions.join(' o ')}`
            });
        }
    };
};

module.exports = { protect, isAdmin, hasRole, hasPermission };
