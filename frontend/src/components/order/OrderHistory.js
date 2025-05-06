import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Chip, 
  CircularProgress, 
  Alert,
  Pagination,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  Receipt, 
  LocalShipping, 
  Search,
  FilterList
} from '@mui/icons-material';
import axios from 'axios';
import Layout from '../common/Layout';

// Mock API call - replace with actual API call in production
const fetchOrders = async (token, page = 1, filters = {}) => {
  // In a real app, this would be an API call
  // return await axios.get('/api/orders', {
  //   headers: { Authorization: `Bearer ${token}` },
  //   params: { page, ...filters }
  // });
  
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter mock data based on status if provided
      let filteredOrders = [
        { 
          _id: 'ord123', 
          order_number: 'ORD-123456',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          total_amount: 125.99, 
          status: 'delivered',
          payment_status: 'paid',
          items: 3
        },
        { 
          _id: 'ord124', 
          order_number: 'ORD-123457',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          total_amount: 89.50, 
          status: 'delivered',
          payment_status: 'paid',
          items: 2
        },
        { 
          _id: 'ord125', 
          order_number: 'ORD-123458',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          total_amount: 210.75, 
          status: 'shipped',
          payment_status: 'paid',
          items: 4
        },
        { 
          _id: 'ord126', 
          order_number: 'ORD-123459',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
          total_amount: 45.25, 
          status: 'processing',
          payment_status: 'paid',
          items: 1
        },
        { 
          _id: 'ord127', 
          order_number: 'ORD-123460',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          total_amount: 150.00, 
          status: 'pending',
          payment_status: 'pending',
          items: 3
        },
        { 
          _id: 'ord128', 
          order_number: 'ORD-123461',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
          total_amount: 75.50, 
          status: 'cancelled',
          payment_status: 'refunded',
          items: 2
        },
        { 
          _id: 'ord129', 
          order_number: 'ORD-123462',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
          total_amount: 95.25, 
          status: 'delivered',
          payment_status: 'paid',
          items: 3
        },
        { 
          _id: 'ord130', 
          order_number: 'ORD-123463',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
          total_amount: 120.00, 
          status: 'delivered',
          payment_status: 'paid',
          items: 4
        }
      ];
      
      if (filters.status && filters.status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.order_number.toLowerCase().includes(searchLower)
        );
      }
      
      // Paginate
      const perPage = 5;
      const totalOrders = filteredOrders.length;
      const totalPages = Math.ceil(totalOrders / perPage);
      const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);
      
      resolve({
        data: {
          orders: paginatedOrders,
          pagination: {
            page,
            perPage,
            total: totalOrders,
            totalPages
          }
        }
      });
    }, 1000);
  });
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  
  useEffect(() => {
    // Check if user is authenticated
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await fetchOrders(userInfo.token, page, filters);
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Orders error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [userInfo, navigate, page, filters]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleStatusChange = (event) => {
    setFilters({
      ...filters,
      status: event.target.value
    });
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters({
      ...filters,
      search: searchInput
    });
    setPage(1); // Reset to first page when search changes
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render loading state
  if (loading && page === 1) {
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
  
  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Order History
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex' }}>
              <TextField
                size="small"
                label="Search Orders"
                variant="outlined"
                fullWidth
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" edge="end">
                      <Search />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              size="small"
              label="Filter by Status"
              value={filters.status}
              onChange={handleStatusChange}
              fullWidth
              InputProps={{
                startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />
              }}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Orders Table */}
      {orders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.payment_status} 
                        color={order.payment_status === 'paid' ? 'success' : 
                               order.payment_status === 'pending' ? 'warning' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Order">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {order.status === 'shipped' && (
                          <Tooltip title="Track Shipment">
                            <IconButton 
                              color="info"
                              onClick={() => navigate(`/orders/${order._id}/tracking`)}
                            >
                              <LocalShipping />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === 'delivered' && (
                          <Tooltip title="Invoice">
                            <IconButton 
                              color="secondary"
                              onClick={() => navigate(`/orders/${order._id}/invoice`)}
                            >
                              <Receipt />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't placed any orders yet or no orders match your search criteria.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Paper>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Layout>
  );
};

export default OrderHistory;