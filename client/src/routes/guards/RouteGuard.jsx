import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'context/auth/AuthProvider';

export default function RouteGuard({ children, mode }) {
  const { isClientUser, isLoggedIn } = useAuth();

  if (mode === 'guest' && isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (mode === 'protected' && (!isLoggedIn || !isClientUser)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
