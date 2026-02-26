import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        // Listen for global 401 unauthorized events
        const handleUnauthorized = () => {
            logout();
        };
        window.addEventListener('auth-unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth-unauthorized', handleUnauthorized);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token: jwtToken } = response.data.data;

            setUser(userData);
            setToken(jwtToken);

            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true, role: userData.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed. Please try again.'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
    };

    if (loading) {
        return null; // Or a global loading spinner
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
