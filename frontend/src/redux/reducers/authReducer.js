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
  AUTH_UPDATE_PROFILE_RESET,
  AUTH_CHECK_STATUS,
  AUTH_CLEAR_ERROR
} from '../constants/authConstants';

// Initial state
const initialState = {
  userInfo: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isVerified: false,
  verifying: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  updateProfileSuccess: false
};

// Auth reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Register cases
    case AUTH_REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isAuthenticated: true,
        error: null
      };
    case AUTH_REGISTER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Login cases
    case AUTH_LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isAuthenticated: true,
        error: null
      };
    case AUTH_LOGIN_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Logout case
    case AUTH_LOGOUT:
      return {
        ...initialState
      };

    // Verify email cases
    case AUTH_VERIFY_REQUEST:
      return {
        ...state,
        verifying: true,
        error: null
      };
    case AUTH_VERIFY_SUCCESS:
      return {
        ...state,
        verifying: false,
        isVerified: true,
        error: null
      };
    case AUTH_VERIFY_FAIL:
      return {
        ...state,
        verifying: false,
        error: action.payload
      };

    // Forgot password cases
    case AUTH_FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        forgotPasswordSuccess: false,
        error: null
      };
    case AUTH_FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        forgotPasswordSuccess: true,
        error: null
      };
    case AUTH_FORGOT_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        forgotPasswordSuccess: false,
        error: action.payload
      };

    // Reset password cases
    case AUTH_RESET_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        resetPasswordSuccess: false,
        error: null
      };
    case AUTH_RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        resetPasswordSuccess: true,
        error: null
      };
    case AUTH_RESET_PASSWORD_FAIL:
      return {
        ...state,
        loading: false,
        resetPasswordSuccess: false,
        error: action.payload
      };

    // Update profile cases
    case AUTH_UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        updateProfileSuccess: false,
        error: null
      };
    case AUTH_UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: {
          ...state.userInfo,
          ...action.payload
        },
        updateProfileSuccess: true,
        error: null
      };
    case AUTH_UPDATE_PROFILE_FAIL:
      return {
        ...state,
        loading: false,
        updateProfileSuccess: false,
        error: action.payload
      };
    case AUTH_UPDATE_PROFILE_RESET:
      return {
        ...state,
        updateProfileSuccess: false,
        error: null
      };

    // Check auth status
    case AUTH_CHECK_STATUS:
      return {
        ...state,
        userInfo: action.payload,
        isAuthenticated: true
      };

    // Clear error
    case AUTH_CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default authReducer;