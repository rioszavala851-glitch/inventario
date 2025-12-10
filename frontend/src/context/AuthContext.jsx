import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            // Ensure this URL points to your running backend
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, config);

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    // ---------------------------------------------------------
    // 🛡️ FOOLPROOF ROLE RESOLVER HELPER
    // ---------------------------------------------------------
    const getResolvedRole = () => {
        if (!user) return null;

        // 1. Check if role is an object with name (New System)
        if (user.role && user.role.name) {
            return user.role.name;
        }

        // 2. Check if role is a string
        if (typeof user.role === 'string') {
            const roleString = user.role;
            // Known Admin Role IDs
            const knownAdminIds = [
                '6937a99623d3ff19b1d74985',
            ];

            if (knownAdminIds.includes(roleString)) {
                return 'administrativo';
            }

            // If it's a long ID string but not known admin, unfortunately we can't guess.
            // But if it's "administrativo" string, we return it.
            if (roleString === 'administrativo' || roleString === 'admin') {
                return 'administrativo';
            }

            // Fallback: if it looks like a role name (short), return it. If ID (long), ignore or return null?
            // Let's assume if it's NOT length 24, it's a name.
            return roleString.length === 24 ? null : roleString;
        }

        // 3. Fallback for specific email
        if (user.email === 'admin@admin.com') return 'administrativo';

        return null;
    };

    // Helper function to check if user is admin
    const isAdmin = () => {
        const role = getResolvedRole();
        return role === 'administrativo' || role === 'admin';
    };

    // Helper function to check if user has specific role
    const hasRole = (role) => {
        const resolvedRole = getResolvedRole();
        // Admin has access to everything usually, but strict check here:
        if (resolvedRole === 'administrativo' || resolvedRole === 'admin') return true;
        return resolvedRole === role;
    };

    // Helper function to check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        const resolvedRole = getResolvedRole();
        if (resolvedRole === 'administrativo' || resolvedRole === 'admin') return true;
        return roles.includes(resolvedRole);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, hasRole, hasAnyRole }}>
            {children}
        </AuthContext.Provider>
    );
};
