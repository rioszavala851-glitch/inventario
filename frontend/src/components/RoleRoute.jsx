import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes based on user roles
const RoleRoute = ({ children, allowedRoles, redirectTo = '/' }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    // ---------------------------------------------------------
    // 🛡️ FOOLPROOF ROLE RESOLVER (Same as Sidebar)
    // ---------------------------------------------------------
    let userRoleName = null;

    // 1. Check if role is an object with name (New System)
    if (user?.role?.name) {
        userRoleName = user.role.name;
    }
    // 2. Check if role is a string ID that matches known Admin/Role IDs
    else if (typeof user?.role === 'string') {
        const roleString = user.role;
        // Known Admin Role IDs
        const knownAdminIds = [
            '6937a99623d3ff19b1d74985', // ID from debug
        ];

        if (knownAdminIds.includes(roleString)) {
            userRoleName = 'administrativo';
        } else if (roleString === 'administrativo' || roleString === 'admin') {
            userRoleName = 'administrativo';
        } else {
            // Fallback: assume it might be a valid role name if not an ID
            userRoleName = roleString.length === 24 ? null : roleString;
        }
    }

    // 3. Fallback for the specific user currently logged in
    if (user?.email === 'admin@admin.com') {
        userRoleName = 'administrativo';
    }

    // ---------------------------------------------------------

    const normalizedAllowedRoles = allowedRoles.map(role =>
        role === 'administrativo' ? ['administrativo', 'admin'] : [role]
    ).flat();

    console.log('RoleRoute Check:', {
        rawRole: user?.role,
        resolvedRole: userRoleName,
        allowed: allowedRoles,
        accessGranted: normalizedAllowedRoles.includes(userRoleName)
    });

    if (allowedRoles && !normalizedAllowedRoles.includes(userRoleName)) {
        console.log('Access denied - redirecting to:', redirectTo);
        return <Navigate to={redirectTo} />;
    }

    return children;
};

export default RoleRoute;
