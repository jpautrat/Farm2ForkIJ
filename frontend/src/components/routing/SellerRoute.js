import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * SellerRoute component
 * Protects routes that require seller privileges
 * Redirects to login page if user is not authenticated
 * Redirects to home page if user is authenticated but not a seller
 */
const SellerRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const isSeller = user && user.role === 'seller';
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

  if (!isSeller) {
    // If authenticated but not a seller, redirect to home with message
    return (
      <Navigate 
        to="/" 
        state={{ 
          message: 'You do not have seller privileges to access this page',
          messageType: 'error'
        }} 
        replace 
      />
    );
  }

  // If authenticated and is a seller, render the child routes
  return <Outlet />;
};

export default SellerRoute;
