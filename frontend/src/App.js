import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SellerDashboardPage from './pages/seller/DashboardPage';
import SellerProductsPage from './pages/seller/ProductsPage';
import SellerOrdersPage from './pages/seller/OrdersPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import SellerRoute from './components/routing/SellerRoute';
import AdminRoute from './components/routing/AdminRoute';

// Redux actions
import { checkAuthStatus } from './redux/actions/authActions';

// Styles
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>Farm2Fork - Direct-to-Door Food Marketplace</title>
        <meta name="description" content="Buy fresh produce directly from local farmers" />
        <meta name="keywords" content="farm, food, local, organic, fresh, produce" />
      </Helmet>

      <div className="app-container">
        <Header />
        <main className="main-content">
          <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={HomePage} />
            <Route exact path="/products" component={ProductsPage} />
            <Route exact path="/products/:id" component={ProductDetailPage} />
            <Route exact path="/cart" component={CartPage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/register" component={RegisterPage} />
            
            {/* Protected Routes */}
            <PrivateRoute exact path="/checkout" component={CheckoutPage} />
            <PrivateRoute exact path="/profile" component={ProfilePage} />
            <PrivateRoute exact path="/orders" component={OrdersPage} />
            <PrivateRoute exact path="/orders/:id" component={OrderDetailPage} />
            
            {/* Seller Routes */}
            <SellerRoute exact path="/seller/dashboard" component={SellerDashboardPage} />
            <SellerRoute exact path="/seller/products" component={SellerProductsPage} />
            <SellerRoute exact path="/seller/orders" component={SellerOrdersPage} />
            
            {/* Admin Routes */}
            <AdminRoute exact path="/admin/dashboard" component={AdminDashboardPage} />
            <AdminRoute exact path="/admin/users" component={AdminUsersPage} />
            <AdminRoute exact path="/admin/products" component={AdminProductsPage} />
            <AdminRoute exact path="/admin/orders" component={AdminOrdersPage} />
            
            {/* 404 Route */}
            <Route exact path="/404" component={NotFoundPage} />
            <Redirect to="/404" />
          </Switch>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;