const User = require('../models/User');

/**
 * Middleware to check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @param {string} operator - 'AND' or 'OR' (default: 'AND')
 * @returns {Function} Express middleware function
 */
const checkPermission = (requiredPermissions, operator = 'AND') => {
    return async (req, res, next) => {
        try {
            // Get user with populated role
            const user = await User.findById(req.user._id).populate('role');

            if (!user || !user.role) {
                return res.status(403).json({
                    message: 'Acceso denegado: Usuario sin rol asignado'
                });
            }

            // Convert to array if single permission
            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            // Check permissions based on operator
            let hasPermission = false;

            if (operator === 'OR') {
                // User needs at least ONE of the permissions
                hasPermission = permissions.some(perm =>
                    user.role.permissions.includes(perm)
                );
            } else {
                // User needs ALL permissions (AND)
                hasPermission = permissions.every(perm =>
                    user.role.permissions.includes(perm)
                );
            }

            if (hasPermission) {
                next();
            } else {
                return res.status(403).json({
                    message: `Acceso denegado: Se requiere permiso(s): ${permissions.join(', ')}`,
                    requiredPermissions: permissions
                });
            }
        } catch (error) {
            console.error('Error en checkPermission middleware:', error);
            res.status(500).json({ message: 'Error del servidor al verificar permisos' });
        }
    };
};

/**
 * Middleware to check if user has ANY of the required permissions
 * @param {string[]} requiredPermissions - Array of permissions
 */
const checkAnyPermission = (requiredPermissions) => {
    return checkPermission(requiredPermissions, 'OR');
};

/**
 * Middleware to check if user has ALL of the required permissions
 * @param {string[]} requiredPermissions - Array of permissions
 */
const checkAllPermissions = (requiredPermissions) => {
    return checkPermission(requiredPermissions, 'AND');
};

module.exports = {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions
};
