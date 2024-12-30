import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
