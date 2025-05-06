import axios from 'axios';
import {
  AUTH_REGISTER_REQUEST,
  AUTH_REGISTER_SUCCESS,
  AUTH_REGISTER_FAIL,
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_LOGOUT,
  AUTH_VERIFY_REQUEST,
  AUTH_VERIFY_SUCCESS,
  AUTH_VERIFY_FAIL,
  AUTH_FORGOT_PASSWORD_REQUEST,
  AUTH_FORGOT_PASSWORD_SUCCESS,
  AUTH_FORGOT_PASSWORD_FAIL,
  AUTH_RESET_PASSWORD_REQUEST,
  AUTH_RESET_PASSWORD_SUCCESS,
  AUTH_RESET_PASSWORD_FAIL,
  AUTH_UPDATE_PROFILE_REQUEST,
  AUTH_UPDATE_PROFILE_SUCCESS,
  AUTH_UPDATE_PROFILE_FAIL,
  AUTH_CHECK_STATUS,
  AUTH_CLEAR_ERROR
} from '../constants/authConstants';

// API base URL
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Register a new user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_REGISTER_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(`${API_URL}/auth/register`, userData, config);

    dispatch({
      type: AUTH_REGISTER_SUCCESS,
      payload: data,
    });

    // Also log the user in
    dispatch({
      type: AUTH_LOGIN_SUCCESS,
      payload: data,
    });

    // Set auth token in headers
    setAuthToken(data.token);

    // Store user info in localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: AUTH_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOGIN_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      config
    );

    dispatch({
      type: AUTH_LOGIN_SUCCESS,
      payload: data,
    });

    // Set auth token in headers
    setAuthToken(data.token);

    // Store user info in localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: AUTH_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Logout user
export const logout = () => (dispatch) => {
  // Remove token from headers
  setAuthToken(null);
  
  // Remove user info from localStorage
  localStorage.removeItem('userInfo');
  
  dispatch({ type: AUTH_LOGOUT });
  
  // Optional: Call logout endpoint to invalidate token on server
  // axios.post(`${API_URL}/auth/logout`);
};

// Verify email
export const verifyEmail = (token) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_VERIFY_REQUEST });

    const { data } = await axios.get(`${API_URL}/auth/verify-email/${token}`);

    dispatch({
      type: AUTH_VERIFY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_VERIFY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Forgot password
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_FORGOT_PASSWORD_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      `${API_URL}/auth/forgot-password`,
      { email },
      config
    );

    dispatch({
      type: AUTH_FORGOT_PASSWORD_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_FORGOT_PASSWORD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Reset password
export const resetPassword = (token, password) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_RESET_PASSWORD_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      `${API_URL}/auth/reset-password`,
      { token, password },
      config
    );

    dispatch({
      type: AUTH_RESET_PASSWORD_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_RESET_PASSWORD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update user profile
export const updateProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: AUTH_UPDATE_PROFILE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`${API_URL}/users/me`, userData, config);

    dispatch({
      type: AUTH_UPDATE_PROFILE_SUCCESS,
      payload: data,
    });

    // Update userInfo in localStorage with new data
    localStorage.setItem('userInfo', JSON.stringify({
      ...userInfo,
      ...data
    }));
  } catch (error) {
    dispatch({
      type: AUTH_UPDATE_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Check authentication status
export const checkAuthStatus = () => (dispatch) => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  if (userInfo && userInfo.token) {
    // Set auth token in headers
    setAuthToken(userInfo.token);
    
    dispatch({
      type: AUTH_CHECK_STATUS,
      payload: userInfo,
    });
  } else {
    dispatch({ type: AUTH_LOGOUT });
  }
};

// Clear error
export const clearError = () => (dispatch) => {
  dispatch({ type: AUTH_CLEAR_ERROR });
};