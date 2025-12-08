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

    // Helper function to check if user is admin
    const isAdmin = () => {
        return user?.role === 'administrativo';
    };

    // Helper function to check if user has specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Helper function to check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, hasRole, hasAnyRole }}>
            {children}
        </AuthContext.Provider>
    );
};
