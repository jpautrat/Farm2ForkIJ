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
  USER_UPDATE_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_ADDRESS_LIST_REQUEST,
  USER_ADDRESS_LIST_SUCCESS,
  USER_ADDRESS_LIST_FAIL,
  USER_ADDRESS_CREATE_REQUEST,
  USER_ADDRESS_CREATE_SUCCESS,
  USER_ADDRESS_CREATE_FAIL,
  USER_ADDRESS_CREATE_RESET,
  USER_ADDRESS_UPDATE_REQUEST,
  USER_ADDRESS_UPDATE_SUCCESS,
  USER_ADDRESS_UPDATE_FAIL,
  USER_ADDRESS_UPDATE_RESET,
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
  USER_SELLER_PROFILE_UPDATE_RESET,
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

// User list reducer (admin)
export const userListReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case USER_LIST_REQUEST:
      return { loading: true };
    case USER_LIST_SUCCESS:
      return {
        loading: false,
        users: action.payload.users,
        pages: action.payload.pages,
        page: action.payload.page,
        count: action.payload.count
      };
    case USER_LIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_LIST_RESET:
      return { users: [] };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User details reducer
export const userDetailsReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_DETAILS_REQUEST:
      return { ...state, loading: true };
    case USER_DETAILS_SUCCESS:
      return { loading: false, user: action.payload };
    case USER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case USER_DETAILS_RESET:
      return { user: {} };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User update reducer (admin)
export const userUpdateReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_UPDATE_REQUEST:
      return { loading: true };
    case USER_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case USER_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_UPDATE_RESET:
      return { user: {} };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User delete reducer (admin)
export const userDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_DELETE_REQUEST:
      return { loading: true };
    case USER_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User address list reducer
export const userAddressListReducer = (state = { addresses: [] }, action) => {
  switch (action.type) {
    case USER_ADDRESS_LIST_REQUEST:
      return { loading: true };
    case USER_ADDRESS_LIST_SUCCESS:
      return { loading: false, addresses: action.payload };
    case USER_ADDRESS_LIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User address create reducer
export const userAddressCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_CREATE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_CREATE_SUCCESS:
      return { loading: false, success: true, address: action.payload };
    case USER_ADDRESS_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_CREATE_RESET:
      return {};
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User address update reducer
export const userAddressUpdateReducer = (state = { address: {} }, action) => {
  switch (action.type) {
    case USER_ADDRESS_UPDATE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_UPDATE_SUCCESS:
      return { loading: false, success: true, address: action.payload };
    case USER_ADDRESS_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_UPDATE_RESET:
      return { address: {} };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User address delete reducer
export const userAddressDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_DELETE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_ADDRESS_DELETE_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User address set default reducer
export const userAddressSetDefaultReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_SET_DEFAULT_REQUEST:
      return { loading: true };
    case USER_ADDRESS_SET_DEFAULT_SUCCESS:
      return { loading: false, success: true };
    case USER_ADDRESS_SET_DEFAULT_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User seller profile reducer
export const userSellerProfileReducer = (state = { sellerProfile: {} }, action) => {
  switch (action.type) {
    case USER_SELLER_PROFILE_REQUEST:
      return { loading: true };
    case USER_SELLER_PROFILE_SUCCESS:
      return { loading: false, sellerProfile: action.payload };
    case USER_SELLER_PROFILE_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User seller profile update reducer
export const userSellerProfileUpdateReducer = (state = { sellerProfile: {} }, action) => {
  switch (action.type) {
    case USER_SELLER_PROFILE_UPDATE_REQUEST:
      return { loading: true };
    case USER_SELLER_PROFILE_UPDATE_SUCCESS:
      return { loading: false, success: true, sellerProfile: action.payload };
    case USER_SELLER_PROFILE_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_SELLER_PROFILE_UPDATE_RESET:
      return { sellerProfile: {} };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User wishlist reducer
export const userWishlistReducer = (state = { wishlist: { items: [] } }, action) => {
  switch (action.type) {
    case USER_WISHLIST_REQUEST:
      return { loading: true };
    case USER_WISHLIST_SUCCESS:
      return { loading: false, wishlist: action.payload };
    case USER_WISHLIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User wishlist add item reducer
export const userWishlistAddItemReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_WISHLIST_ADD_ITEM_REQUEST:
      return { loading: true };
    case USER_WISHLIST_ADD_ITEM_SUCCESS:
      return { loading: false, success: true };
    case USER_WISHLIST_ADD_ITEM_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// User wishlist remove item reducer
export const userWishlistRemoveItemReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_WISHLIST_REMOVE_ITEM_REQUEST:
      return { loading: true };
    case USER_WISHLIST_REMOVE_ITEM_SUCCESS:
      return { loading: false, success: true };
    case USER_WISHLIST_REMOVE_ITEM_FAIL:
      return { loading: false, error: action.payload };
    case USER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};