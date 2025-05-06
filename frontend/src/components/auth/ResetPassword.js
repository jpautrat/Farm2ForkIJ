import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useParams, useHistory } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  Divider,
  Alert,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Redux actions
import { resetPassword, clearError } from '../../redux/actions/authActions';

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
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
}));

const ResetPassword = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { token } = useParams();

  // Component state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redux state
  const { loading, error, resetPasswordSuccess } = useSelector(
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

  // Redirect to login if password reset is successful
  useEffect(() => {
    if (resetPasswordSuccess) {
      setTimeout(() => {
        history.push('/login');
      }, 3000); // Redirect after 3 seconds
    }
  }, [resetPasswordSuccess, history]);

  // Handle form submission
  const handleSubmit = (values) => {
    dispatch(resetPassword(token, values.password));
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Enter your new password
        </Typography>

        {error && (
          <Box width="100%" mt={2}>
            <Alert severity="error" className={classes.alert}>
              {error}
            </Alert>
          </Box>
        )}

        {resetPasswordSuccess ? (
          <Box width="100%" mt={2}>
            <Alert severity="success" className={classes.alert}>
              Your password has been reset successfully. You will be redirected
              to the login page shortly.
            </Alert>
            <Box mt={2} textAlign="center">
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
              >
                Go to Login
              </Button>
            </Box>
          </Box>
        ) : (
          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
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
                      name="password"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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
                    'Reset Password'
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

export default ResetPassword;