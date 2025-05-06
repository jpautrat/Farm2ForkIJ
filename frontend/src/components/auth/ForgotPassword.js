import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Box,
  CircularProgress,
  Divider,
  Alert,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// Redux actions
import { forgotPassword, clearError } from '../../redux/actions/authActions';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

// Styles
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
    borderRadius: theme.shape.borderRadius * 2,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
  successMessage: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    borderRadius: theme.shape.borderRadius,
  },
}));

const ForgotPassword = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Redux state
  const { loading, error, forgotPasswordSuccess } = useSelector(
    (state) => state.auth
  );

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Handle form submission
  const handleSubmit = (values) => {
    dispatch(forgotPassword(values.email));
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Enter your email address and we'll send you a link to reset your
          password
        </Typography>

        {error && (
          <Box width="100%" mt={2}>
            <Alert severity="error" className={classes.alert}>
              {error}
            </Alert>
          </Box>
        )}

        {forgotPasswordSuccess ? (
          <Box width="100%" mt={2}>
            <Alert severity="success" className={classes.alert}>
              Password reset instructions have been sent to your email address.
              Please check your inbox.
            </Alert>
            <Box mt={2} textAlign="center">
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
              >
                Return to Login
              </Button>
            </Box>
          </Box>
        ) : (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Divider className={classes.divider} />

                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      Remember your password?{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
                        variant="body2"
                        color="primary"
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;