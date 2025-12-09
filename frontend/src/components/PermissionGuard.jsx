import { usePermission } from '../hooks/usePermission';

/**
 * Component to conditionally render children based on user permissions
 * @param {string|string[]} permission - Required permission(s)
 * @param {string} operator - 'AND' or 'OR' (default: 'AND')
 * @param {React.ReactNode} children - Content to render if user has permission
 * @param {React.ReactNode} fallback - Optional content to render if user lacks permission
 */
const PermissionGuard = ({ permission, operator = 'AND', children, fallback = null }) => {
    const hasPermission = usePermission(permission, operator);

    if (hasPermission) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
};

export default PermissionGuard;
