import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  People, 
  ShoppingCart, 
  LocalShipping, 
  AttachMoney, 
  Star, 
  Category, 
  Inventory, 
  Person, 
  Receipt 
} from '@mui/icons-material';
import axios from 'axios';
import Layout from '../common/Layout';
import { getAdminDashboardStats } from '../../redux/actions/userActions';

// Real API call to fetch admin dashboard statistics
const fetchDashboardStats = async (token) => {
  try {
    return await axios.get('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetchDashboardStats(userInfo.token);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics. Please try again later.');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [userInfo, navigate]);

  // Render loading state
  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </Layout>
    );
  }

  // Render dashboard
  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="text.secondary">
                Total Users
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <People />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats.users.total.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {stats.users.buyers.toLocaleString()} buyers, {stats.users.sellers.toLocaleString()} sellers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="text.secondary">
                Total Products
              </Typography>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Inventory />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats.products.total.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {stats.products.active.toLocaleString()} active, {stats.products.outOfStock.toLocaleString()} out of stock
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="text.secondary">
                Total Orders
              </Typography>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <ShoppingCart />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats.orders.total.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {stats.orders.pending.toLocaleString()} pending, {stats.orders.processing.toLocaleString()} processing
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color="text.secondary">
                Total Revenue
              </Typography>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AttachMoney />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              ${stats.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              From {stats.revenue.paidOrders.toLocaleString()} paid orders
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Orders" />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {stats.recent.orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <ListItem
                      secondaryAction={
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          View
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Receipt />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${order._id.substring(3)}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {`${order.user_id.first_name} ${order.user_id.last_name}`}
                            </Typography>
                            {` — $${order.total_amount.toFixed(2)} — ${order.status}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/admin/orders')}
                >
                  View All Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Users" />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {stats.recent.users.map((user) => (
                  <React.Fragment key={user._id}>
                    <ListItem
                      secondaryAction={
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                        >
                          View
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.first_name} ${user.last_name}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {user.email}
                            </Typography>
                            {` — ${user.role}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/admin/users')}
                >
                  View All Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
              sx={{ p: 2 }}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Inventory />}
              onClick={() => navigate('/admin/products')}
              sx={{ p: 2 }}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Category />}
              onClick={() => navigate('/admin/categories')}
              sx={{ p: 2 }}
            >
              Manage Categories
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Receipt />}
              onClick={() => navigate('/admin/orders')}
              sx={{ p: 2 }}
            >
              Manage Orders
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Star />}
              onClick={() => navigate('/admin/reviews')}
              sx={{ p: 2 }}
            >
              Manage Reviews
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<LocalShipping />}
              onClick={() => navigate('/admin/shipping')}
              sx={{ p: 2 }}
            >
              Manage Shipping
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
