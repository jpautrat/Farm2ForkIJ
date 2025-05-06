import React, { useState } from 'react';
import {
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Button,
  Box,
  Collapse,
} from '@material-ui/core';
import {
  CreditCard,
  Payment as PaymentIcon,
  AccountBalance,
  ExpandMore,
  ExpandLess,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Styles
const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  paymentIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  cardDetails: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  submitButton: {
    marginTop: theme.spacing(3),
  },
  paymentMethod: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      cursor: 'pointer',
    },
  },
  selectedPaymentMethod: {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    backgroundColor: theme.palette.action.selected,
  },
  paymentMethodHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  paymentMethodTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  expandIcon: {
    transition: 'transform 0.3s',
  },
  expanded: {
    transform: 'rotate(180deg)',
  },
}));

// Credit card validation schema
const creditCardSchema = Yup.object({
  cardName: Yup.string().required('Name on card is required'),
  cardNumber: Yup.string()
    .required('Card number is required')
    .matches(/^\d{16}$/, 'Card number must be 16 digits'),
  expDate: Yup.string()
    .required('Expiration date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiration date must be in MM/YY format'),
  cvv: Yup.string()
    .required('CVV is required')
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

const PaymentForm = ({ initialData = {}, onSubmit }) => {
  const classes = useStyles();
  
  // Component state
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod || 'credit');
  const [expanded, setExpanded] = useState('credit');

  // Credit card form
  const formik = useFormik({
    initialValues: {
      cardName: '',
      cardNumber: '',
      expDate: '',
      cvv: '',
    },
    validationSchema: creditCardSchema,
    onSubmit: (values) => {
      // Only validate credit card details if credit card is selected
      if (paymentMethod === 'credit') {
        // Submit with credit card details
        onSubmit({
          paymentMethod,
          cardDetails: values,
        });
      } else {
        // Submit with just the payment method
        onSubmit({ paymentMethod });
      }
    },
  });

  // Handle payment method change
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setExpanded(event.target.value);
  };

  // Handle expand/collapse
  const handleExpand = (method) => {
    setExpanded(expanded === method ? '' : method);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom className={classes.sectionTitle}>
        Payment Method
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <FormControl component="fieldset" className={classes.formControl} fullWidth>
          <RadioGroup
            aria-label="payment-method"
            name="paymentMethod"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            {/* Credit Card Option */}
            <Paper 
              className={`${classes.paymentMethod} ${
                paymentMethod === 'credit' ? classes.selectedPaymentMethod : ''
              }`}
              onClick={() => setPaymentMethod('credit')}
            >
              <div className={classes.paymentMethodHeader}>
                <FormControlLabel
                  value="credit"
                  control={<Radio color="primary" />}
                  label={
                    <div className={classes.paymentMethodTitle}>
                      <CreditCard className={classes.paymentIcon} />
                      <Typography variant="subtitle1">Credit Card</Typography>
                    </div>
                  }
                />
                <IconButton
                  className={`${classes.expandIcon} ${
                    expanded === 'credit' ? classes.expanded : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand('credit');
                  }}
                  size="small"
                >
                  {expanded === 'credit' ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
              
              <Collapse in={expanded === 'credit'}>
                <Grid container spacing={3} className={classes.cardGrid}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      id="cardName"
                      name="cardName"
                      label="Name on card"
                      fullWidth
                      autoComplete="cc-name"
                      variant="outlined"
                      value={formik.values.cardName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cardName && Boolean(formik.errors.cardName)}
                      helperText={formik.touched.cardName && formik.errors.cardName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      id="cardNumber"
                      name="cardNumber"
                      label="Card number"
                      fullWidth
                      autoComplete="cc-number"
                      variant="outlined"
                      value={formik.values.cardNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                      helperText={formik.touched.cardNumber && formik.errors.cardNumber}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="expDate"
                      name="expDate"
                      label="Expiry date (MM/YY)"
                      fullWidth
                      autoComplete="cc-exp"
                      variant="outlined"
                      value={formik.values.expDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.expDate && Boolean(formik.errors.expDate)}
                      helperText={formik.touched.expDate && formik.errors.expDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="cvv"
                      name="cvv"
                      label="CVV"
                      fullWidth
                      autoComplete="cc-csc"
                      variant="outlined"
                      value={formik.values.cvv}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                      helperText={formik.touched.cvv && formik.errors.cvv}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>

            {/* PayPal Option */}
            <Paper 
              className={`${classes.paymentMethod} ${
                paymentMethod === 'paypal' ? classes.selectedPaymentMethod : ''
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className={classes.paymentMethodHeader}>
                <FormControlLabel
                  value="paypal"
                  control={<Radio color="primary" />}
                  label={
                    <div className={classes.paymentMethodTitle}>
                      <PaymentIcon className={classes.paymentIcon} />
                      <Typography variant="subtitle1">PayPal</Typography>
                    </div>
                  }
                />
                <IconButton
                  className={`${classes.expandIcon} ${
                    expanded === 'paypal' ? classes.expanded : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand('paypal');
                  }}
                  size="small"
                >
                  {expanded === 'paypal' ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
              
              <Collapse in={expanded === 'paypal'}>
                <Box p={2}>
                  <Typography variant="body2" color="textSecondary">
                    You will be redirected to PayPal to complete your purchase securely.
                  </Typography>
                </Box>
              </Collapse>
            </Paper>

            {/* Bank Transfer Option */}
            <Paper 
              className={`${classes.paymentMethod} ${
                paymentMethod === 'bank' ? classes.selectedPaymentMethod : ''
              }`}
              onClick={() => setPaymentMethod('bank')}
            >
              <div className={classes.paymentMethodHeader}>
                <FormControlLabel
                  value="bank"
                  control={<Radio color="primary" />}
                  label={
                    <div className={classes.paymentMethodTitle}>
                      <AccountBalance className={classes.paymentIcon} />
                      <Typography variant="subtitle1">Bank Transfer</Typography>
                    </div>
                  }
                />
                <IconButton
                  className={`${classes.expandIcon} ${
                    expanded === 'bank' ? classes.expanded : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpand('bank');
                  }}
                  size="small"
                >
                  {expanded === 'bank' ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
              
              <Collapse in={expanded === 'bank'}>
                <Box p={2}>
                  <Typography variant="body2" color="textSecondary">
                    You will receive our bank details after placing the order. Your order will be processed once payment is received.
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          </RadioGroup>
        </FormControl>

        <Divider className={classes.divider} />

        <Typography variant="body2" color="textSecondary" gutterBottom>
          All transactions are secure and encrypted. We never store your full credit card details.
        </Typography>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
          disabled={paymentMethod === 'credit' && (!formik.isValid || formik.isSubmitting)}
        >
          Continue to Review
        </Button>
      </form>
    </>
  );
};

export default PaymentForm;