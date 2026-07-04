import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="relative flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
          <p className="mt-4 font-outfit text-sm font-semibold text-slate-600 animate-pulse">
            MediFlow Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to unauthorized page if role is not permitted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
