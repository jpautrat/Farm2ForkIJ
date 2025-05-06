import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * AdminRoute component
 * Protects routes that require admin privileges
 * Redirects to login page if user is not authenticated
 * Redirects to home page if user is authenticated but not an admin
 */
const AdminRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === 'admin';
  const location = useLocation();

  if (loading) {
    // Show loading spinner or placeholder while checking auth status
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If authenticated but not an admin, redirect to home with message
    return (
      <Navigate 
        to="/" 
        state={{ 
          message: 'You do not have admin privileges to access this page',
          messageType: 'error'
        }} 
        replace 
      />
    );
  }

  // If authenticated and is an admin, render the child routes
  return <Outlet />;
};

export default AdminRoute;
