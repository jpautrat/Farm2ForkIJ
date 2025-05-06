import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
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

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
