import axios from 'axios';
import {
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_RESET,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_DETAILS_RESET,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_ADDRESS_LIST_REQUEST,
  USER_ADDRESS_LIST_SUCCESS,
  USER_ADDRESS_LIST_FAIL,
  USER_ADDRESS_CREATE_REQUEST,
  USER_ADDRESS_CREATE_SUCCESS,
  USER_ADDRESS_CREATE_FAIL,
  USER_ADDRESS_UPDATE_REQUEST,
  USER_ADDRESS_UPDATE_SUCCESS,
  USER_ADDRESS_UPDATE_FAIL,
  USER_ADDRESS_DELETE_REQUEST,
  USER_ADDRESS_DELETE_SUCCESS,
  USER_ADDRESS_DELETE_FAIL,
  USER_ADDRESS_SET_DEFAULT_REQUEST,
  USER_ADDRESS_SET_DEFAULT_SUCCESS,
  USER_ADDRESS_SET_DEFAULT_FAIL,
  USER_SELLER_PROFILE_REQUEST,
  USER_SELLER_PROFILE_SUCCESS,
  USER_SELLER_PROFILE_FAIL,
  USER_SELLER_PROFILE_UPDATE_REQUEST,
  USER_SELLER_PROFILE_UPDATE_SUCCESS,
  USER_SELLER_PROFILE_UPDATE_FAIL,
  USER_WISHLIST_REQUEST,
  USER_WISHLIST_SUCCESS,
  USER_WISHLIST_FAIL,
  USER_WISHLIST_ADD_ITEM_REQUEST,
  USER_WISHLIST_ADD_ITEM_SUCCESS,
  USER_WISHLIST_ADD_ITEM_FAIL,
  USER_WISHLIST_REMOVE_ITEM_REQUEST,
  USER_WISHLIST_REMOVE_ITEM_SUCCESS,
  USER_WISHLIST_REMOVE_ITEM_FAIL,
  USER_CLEAR_ERROR
} from '../constants/userConstants';

// API base URL
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Get seller profile
export const getSellerProfile = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_SELLER_PROFILE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/seller/profile`, config);

    dispatch({
      type: USER_SELLER_PROFILE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_SELLER_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update seller profile
export const updateSellerProfile = (profileData) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_SELLER_PROFILE_UPDATE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`${API_URL}/seller/profile`, profileData, config);

    dispatch({
      type: USER_SELLER_PROFILE_UPDATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_SELLER_PROFILE_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get seller dashboard stats
export const getSellerDashboardStats = () => async (dispatch, getState) => {
  try {
    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/seller/dashboard`, config);
    
    return data;
  } catch (error) {
    console.error('Error fetching seller dashboard stats:', error);
    throw error;
  }
};

// Get user list (admin only)
export const listUsers = (page = 1, limit = 10, filters = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
      params: {
        page,
        limit,
        ...filters
      }
    };

    const { data } = await axios.get(`${API_URL}/admin/users`, config);

    dispatch({
      type: USER_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get user details (admin only)
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/admin/users/${id}`, config);

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update user (admin only)
export const updateUser = (id, userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`${API_URL}/admin/users/${id}`, userData, config);

    dispatch({
      type: USER_UPDATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Delete user (admin only)
export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DELETE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`${API_URL}/admin/users/${id}`, config);

    dispatch({ type: USER_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: USER_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get admin dashboard stats
export const getAdminDashboardStats = () => async (dispatch, getState) => {
  try {
    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${API_URL}/admin/dashboard`, config);
    
    return data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

// Clear error
export const clearError = () => (dispatch) => {
  dispatch({ type: USER_CLEAR_ERROR });
};