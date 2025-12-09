import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if the current user has a specific permission or permissions
 * @param {string|string[]} permission - Single permission or array of permissions
 * @param {string} operator - 'AND' or 'OR' (default: 'AND')
 * @returns {boolean} - True if user has the required permission(s)
 */
export const usePermission = (permission, operator = 'AND') => {
    const { user } = useAuth();

    if (!user || !user.role || !user.role.permissions) {
        return false;
    }

    // Convert to array if single permission
    const permissions = Array.isArray(permission) ? permission : [permission];

    // Check permissions based on operator
    if (operator === 'OR') {
        // User needs at least ONE of the permissions
        return permissions.some(perm => user.role.permissions.includes(perm));
    } else {
        // User needs ALL permissions (AND)
        return permissions.every(perm => user.role.permissions.includes(perm));
    }
};

/**
 * Hook to check if user has ANY of the required permissions
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const useAnyPermission = (permissions) => {
    return usePermission(permissions, 'OR');
};

/**
 * Hook to check if user has ALL of the required permissions
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const useAllPermissions = (permissions) => {
    return usePermission(permissions, 'AND');
};
