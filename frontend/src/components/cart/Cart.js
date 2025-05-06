import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Divider,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
} from '@material-ui/core';
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Payment,
  ExpandMore,
  ExpandLess,
  Delete,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Components
import CartItem from './CartItem';

// Redux actions
import {
  calculateCartPrices,
  applyCoupon,
  removeCoupon,
  clearCart,
} from '../../redux/actions/cartActions';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  title: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  summaryPaper: {
    padding: theme.spacing(3),
    position: 'sticky',
    top: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& > *': {
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
  },
  checkoutButton: {
    marginTop: theme.spacing(2),
  },
  emptyCart: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  emptyCartIcon: {
    fontSize: 60,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  couponForm: {
    display: 'flex',
    marginTop: theme.spacing(2),
  },
  couponInput: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
  },
  discountAmount: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  expandButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  clearCartButton: {
    marginTop: theme.spacing(2),
  },
}));

const Cart = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  // Component state
  const [couponCode, setCouponCode] = useState('');
  const [expandedSection, setExpandedSection] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Redux state
  const {
    cartItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    coupon,
    couponLoading,
    couponError,
  } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Calculate cart totals when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      dispatch(calculateCartPrices());
    }
  }, [dispatch, cartItems]);

  // Show error message if coupon application fails
  useEffect(() => {
    if (couponError) {
      setSnackbarMessage(couponError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [couponError]);

  // Handle coupon code input change
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  // Handle apply coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      dispatch(applyCoupon(couponCode));
      setCouponCode('');
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setSnackbarMessage('Coupon removed');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      setSnackbarMessage('Cart cleared');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (isAuthenticated) {
      history.push('/checkout');
    } else {
      history.push('/login?redirect=checkout');
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <Container className={classes.root}>
        <Typography variant="h4" component="h1" className={classes.title}>
          <ShoppingCart className={classes.titleIcon} />
          Shopping Cart
        </Typography>
        <Paper className={classes.emptyCart}>
          <ShoppingCart className={classes.emptyCartIcon} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.root}>
      <Typography variant="h4" component="h1" className={classes.title}>
        <ShoppingCart className={classes.titleIcon} />
        Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Cart Items
            </Typography>
            <Divider className={classes.divider} />

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <CartItem key={item.product} item={item} />
            ))}

            {/* Clear Cart Button */}
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Delete />}
              onClick={handleClearCart}
              className={classes.clearCartButton}
              size="small"
            >
              Clear Cart
            </Button>
          </Paper>

          {/* Continue Shopping Button */}
          <Button
            component={RouterLink}
            to="/products"
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
        </Grid>

        {/* Cart Summary */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.summaryPaper}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider className={classes.divider} />

            {/* Summary Details */}
            <div className={classes.summaryRow}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">${itemsPrice.toFixed(2)}</Typography>
            </div>

            <div className={classes.summaryRow}>
              <Typography variant="body1">Tax:</Typography>
              <Typography variant="body1">${taxPrice.toFixed(2)}</Typography>
            </div>

            <div className={classes.summaryRow}>
              <Typography variant="body1">Shipping:</Typography>
              <Typography variant="body1">
                {shippingPrice > 0 ? `$${shippingPrice.toFixed(2)}` : 'Calculated at checkout'}
              </Typography>
            </div>

            {discountAmount > 0 && (
              <div className={classes.summaryRow}>
                <Typography variant="body1">Discount:</Typography>
                <Typography variant="body1" className={classes.discountAmount}>
                  -${discountAmount.toFixed(2)}
                </Typography>
              </div>
            )}

            <Divider className={classes.divider} />

            {/* Total */}
            <div className={classes.totalRow}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </div>

            {/* Coupon Code */}
            <div>
              <Typography
                variant="subtitle2"
                onClick={() => handleSectionToggle('coupon')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {coupon ? 'Coupon Applied' : 'Have a coupon code?'}
                <IconButton className={classes.expandButton} size="small">
                  {expandedSection === 'coupon' ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Typography>

              <Collapse in={expandedSection === 'coupon'}>
                {coupon ? (
                  <Box mt={1}>
                    <Paper variant="outlined" style={{ padding: '8px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Typography variant="subtitle2" color="primary">
                            {coupon.code}
                          </Typography>
                          <Typography variant="body2">
                            {coupon.type === 'percentage'
                              ? `${coupon.value}% off`
                              : `$${coupon.value} off`}
                          </Typography>
                        </div>
                        <IconButton
                          size="small"
                          onClick={handleRemoveCoupon}
                          aria-label="remove coupon"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </Paper>
                  </Box>
                ) : (
                  <form onSubmit={handleApplyCoupon} className={classes.couponForm}>
                    <TextField
                      className={classes.couponInput}
                      size="small"
                      variant="outlined"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={handleCouponChange}
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? <CircularProgress size={24} /> : 'Apply'}
                    </Button>
                  </form>
                )}
              </Collapse>
            </div>

            {/* Shipping Info */}
            <div style={{ marginTop: '16px' }}>
              <Typography
                variant="subtitle2"
                onClick={() => handleSectionToggle('shipping')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                Shipping Information
                <IconButton className={classes.expandButton} size="small">
                  {expandedSection === 'shipping' ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Typography>

              <Collapse in={expandedSection === 'shipping'}>
                <List dense>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      primary="Standard Shipping"
                      secondary="7-10 business days"
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">Free</Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      primary="Express Shipping"
                      secondary="2-3 business days"
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">$9.99</Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      primary="Next Day Delivery"
                      secondary="Next business day"
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">$19.99</Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
                  * Actual shipping options and rates will be calculated at checkout based on your location.
                </Typography>
              </Collapse>
            </div>

            {/* Checkout Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className={classes.checkoutButton}
              startIcon={isAuthenticated ? <Payment /> : <LocalShipping />}
              onClick={handleCheckout}
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;