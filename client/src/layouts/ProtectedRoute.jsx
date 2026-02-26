import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Role not authorized, redirect to their respective dashboard
        return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
