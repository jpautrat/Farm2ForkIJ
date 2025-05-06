import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Divider,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
} from '@material-ui/core';
import { PhotoCamera, Save } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Redux actions
import { updateProfile, clearError } from '../../redux/actions/authActions';

// Validation schema
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string().matches(
    /^(\+\d{1,3}[- ]?)?\d{10}$/,
    'Please enter a valid phone number'
  ),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

// Styles
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
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
  tabs: {
    marginBottom: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: '0 auto',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  uploadButton: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: '50%',
    transform: 'translateX(50%)',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
  },
  section: {
    marginTop: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
}));

// Tab Panel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Component state
  const [tabValue, setTabValue] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Redux state
  const { userInfo, loading, error, updateProfileSuccess } = useSelector(
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle avatar change
  const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    formData.append('phone', values.phone || '');
    formData.append('bio', values.bio || '');
    
    if (avatarFile) {
      formData.append('profilePicture', avatarFile);
    }
    
    dispatch(updateProfile(formData));
  };

  // If no user info, show loading
  if (!userInfo) {
    return (
      <Container component="main" maxWidth="md">
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper className={classes.paper}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          className={classes.tabs}
        >
          <Tab label="Profile Information" />
          <Tab label="Addresses" />
          <Tab label="Payment Methods" />
          <Tab label="Preferences" />
        </Tabs>

        {error && (
          <Box width="100%" mb={2}>
            <Alert severity="error" className={classes.alert}>
              {error}
            </Alert>
          </Box>
        )}

        {updateProfileSuccess && (
          <Box width="100%" mb={2}>
            <Alert severity="success" className={classes.alert}>
              Profile updated successfully!
            </Alert>
          </Box>
        )}

        <TabPanel value={tabValue} index={0}>
          <div className={classes.avatarContainer}>
            <Avatar
              className={classes.avatar}
              src={avatarPreview || userInfo.profilePicture}
              alt={`${userInfo.firstName} ${userInfo.lastName}`}
            >
              {userInfo.firstName && userInfo.firstName.charAt(0)}
              {userInfo.lastName && userInfo.lastName.charAt(0)}
            </Avatar>
            <input
              accept="image/*"
              className={classes.input}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                className={classes.uploadButton}
                size="small"
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </div>

          <Formik
            initialValues={{
              firstName: userInfo.firstName || '',
              lastName: userInfo.lastName || '',
              email: userInfo.email || '',
              phone: userInfo.phone || '',
              bio: userInfo.bio || '',
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      autoComplete="given-name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
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
                      id="phone"
                      label="Phone Number"
                      name="phone"
                      autoComplete="tel"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="bio"
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      error={touched.bio && Boolean(errors.bio)}
                      helperText={touched.bio && errors.bio}
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
                  startIcon={<Save />}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Your Addresses
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Address management will be implemented in a future update.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Your Payment Methods
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Payment method management will be implemented in a future update.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Your Preferences
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Preference management will be implemented in a future update.
          </Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Profile;