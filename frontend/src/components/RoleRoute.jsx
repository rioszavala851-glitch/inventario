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

    // Check if user has one of the allowed roles
    // Support both 'admin' (old) and 'administrativo' (new) for backward compatibility
    const userRole = user.role;
    const normalizedAllowedRoles = allowedRoles.map(role =>
        role === 'administrativo' ? ['administrativo', 'admin'] : [role]
    ).flat();

    console.log('RoleRoute - User role:', userRole);
    console.log('RoleRoute - Allowed roles:', allowedRoles);
    console.log('RoleRoute - Normalized allowed roles:', normalizedAllowedRoles);

    if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        console.log('Access denied - redirecting to:', redirectTo);
        // Redirect to default page or show access denied
        return <Navigate to={redirectTo} />;
    }

    return children;
};

export default RoleRoute;
