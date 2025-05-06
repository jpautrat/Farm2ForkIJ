import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// Components
import ShippingForm from './checkout/ShippingForm';
import PaymentForm from './checkout/PaymentForm';
import ReviewOrder from './checkout/ReviewOrder';

// Redux actions
import {
  saveShippingAddress,
  savePaymentMethod,
  getShippingRates,
} from '../../redux/actions/cartActions';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
}));

// Step titles
const steps = ['Shipping address', 'Payment details', 'Review your order'];

const Checkout = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Redux state
  const { cartItems, shippingAddress, paymentMethod, totalPrice } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  // Check if user is authenticated and cart has items
  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login?redirect=checkout');
    } else if (cartItems.length === 0) {
      history.push('/cart');
    }
  }, [isAuthenticated, cartItems, history]);

  // Initialize shipping form with saved address
  useEffect(() => {
    if (shippingAddress) {
      setShippingData(shippingAddress);
    }
  }, [shippingAddress]);

  // Initialize payment form with saved method
  useEffect(() => {
    if (paymentMethod) {
      setPaymentData({ paymentMethod });
    }
  }, [paymentMethod]);

  // Get shipping rates when shipping address is set
  useEffect(() => {
    if (activeStep === 1 && shippingAddress && shippingAddress.postalCode) {
      dispatch(getShippingRates());
    }
  }, [activeStep, shippingAddress, dispatch]);

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      // Save shipping address
      dispatch(saveShippingAddress(shippingData));
    } else if (activeStep === 1) {
      // Save payment method
      dispatch(savePaymentMethod(paymentData.paymentMethod));
    } else if (activeStep === 2) {
      // Place order
      handlePlaceOrder();
      return;
    }
    setActiveStep(activeStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Handle shipping form submission
  const handleShippingSubmit = (data) => {
    setShippingData(data);
    handleNext();
  };

  // Handle payment form submission
  const handlePaymentSubmit = (data) => {
    setPaymentData(data);
    handleNext();
  };

  // Handle place order
  const handlePlaceOrder = () => {
    // This would typically dispatch an action to create an order
    // For now, we'll just show a success message and redirect
    setSnackbarMessage('Order placed successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Redirect to confirmation page after a delay
    setTimeout(() => {
      history.push('/order-confirmation');
    }, 2000);
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Get step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <ShippingForm initialData={shippingData} onSubmit={handleShippingSubmit} />;
      case 1:
        return <PaymentForm initialData={paymentData} onSubmit={handlePaymentSubmit} />;
      case 2:
        return <ReviewOrder />;
      default:
        throw new Error('Unknown step');
    }
  };

  // If not authenticated or cart is empty, show loading
  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className={classes.root}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          // Order confirmation
          <Box mt={3}>
            <Typography variant="h5" gutterBottom>
              Thank you for your order.
            </Typography>
            <Typography variant="subtitle1">
              Your order number is #2001539. We have emailed your order
              confirmation, and will send you an update when your order has
              shipped.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push('/')}
              className={classes.button}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          // Checkout steps
          <>
            {getStepContent(activeStep)}
            <div className={classes.buttons}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} className={classes.button}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
                disabled={
                  (activeStep === 0 && Object.keys(shippingData).length === 0) ||
                  (activeStep === 1 && !paymentData.paymentMethod)
                }
              >
                {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
              </Button>
            </div>
          </>
        )}
      </Paper>

      {/* Order Summary */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Divider className={classes.divider} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">
              ${totalPrice.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

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

export default Checkout;