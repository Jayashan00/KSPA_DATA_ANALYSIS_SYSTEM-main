import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if the user has one of the allowed roles
  if (allowedRoles && !allowedRoles.some(role => user.roles?.includes(`ROLE_${role}`))) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Access Denied</div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;