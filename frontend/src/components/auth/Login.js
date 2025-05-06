import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
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
import { login, clearError } from '../../redux/actions/authActions';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
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

const Login = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const { from } = location.state || { from: { pathname: '/' } };

  // Component state
  const [showPassword, setShowPassword] = useState(false);

  // Redux state
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      history.replace(from);
    }
  }, [isAuthenticated, history, from]);

  // Handle form submission
  const handleSubmit = (values) => {
    dispatch(login(values.email, values.password));
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Sign in to your Farm2Fork account
        </Typography>

        {error && (
          <Box width="100%" mt={2}>
            <Alert severity="error" className={classes.alert}>
              {error}
            </Alert>
          </Box>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
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
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  'Sign In'
                )}
              </Button>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>

              <Divider className={classes.divider} />

              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      variant="body2"
                      color="primary"
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Login;