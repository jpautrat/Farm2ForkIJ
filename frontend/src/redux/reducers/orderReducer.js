import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_CREATE_RESET,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_PAY_RESET,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_DELIVER_RESET,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_LIST_MY_FAIL,
  ORDER_LIST_MY_RESET,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAIL,
  ORDER_CANCEL_RESET,
  ORDER_REFUND_REQUEST,
  ORDER_REFUND_SUCCESS,
  ORDER_REFUND_FAIL,
  ORDER_REFUND_RESET,
  ORDER_SHIPPING_UPDATE_REQUEST,
  ORDER_SHIPPING_UPDATE_SUCCESS,
  ORDER_SHIPPING_UPDATE_FAIL,
  ORDER_SHIPPING_UPDATE_RESET,
  ORDER_CLEAR_ERROR
} from '../constants/orderConstants';

// Order create reducer
export const orderCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CREATE_REQUEST:
      return { loading: true };
    case ORDER_CREATE_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case ORDER_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CREATE_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order details reducer
export const orderDetailsReducer = (
  state = { loading: true, orderItems: [], shippingAddress: {} },
  action
) => {
  switch (action.type) {
    case ORDER_DETAILS_REQUEST:
      return { ...state, loading: true };
    case ORDER_DETAILS_SUCCESS:
      return { loading: false, order: action.payload };
    case ORDER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order pay reducer
export const orderPayReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_PAY_REQUEST:
      return { loading: true };
    case ORDER_PAY_SUCCESS:
      return { loading: false, success: true };
    case ORDER_PAY_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_PAY_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order deliver reducer
export const orderDeliverReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_DELIVER_REQUEST:
      return { loading: true };
    case ORDER_DELIVER_SUCCESS:
      return { loading: false, success: true };
    case ORDER_DELIVER_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_DELIVER_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// My orders list reducer
export const orderListMyReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case ORDER_LIST_MY_REQUEST:
      return { loading: true };
    case ORDER_LIST_MY_SUCCESS:
      return { loading: false, orders: action.payload };
    case ORDER_LIST_MY_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_LIST_MY_RESET:
      return { orders: [] };
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// All orders list reducer (admin)
export const orderListReducer = (state = { orders: [] }, action) => {
  switch (action.type) {
    case ORDER_LIST_REQUEST:
      return { loading: true };
    case ORDER_LIST_SUCCESS:
      return {
        loading: false,
        orders: action.payload.orders,
        pages: action.payload.pages,
        page: action.payload.page,
        count: action.payload.count
      };
    case ORDER_LIST_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order cancel reducer
export const orderCancelReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_CANCEL_REQUEST:
      return { loading: true };
    case ORDER_CANCEL_SUCCESS:
      return { loading: false, success: true };
    case ORDER_CANCEL_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_CANCEL_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order refund reducer
export const orderRefundReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_REFUND_REQUEST:
      return { loading: true };
    case ORDER_REFUND_SUCCESS:
      return { loading: false, success: true };
    case ORDER_REFUND_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_REFUND_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Order shipping update reducer
export const orderShippingUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ORDER_SHIPPING_UPDATE_REQUEST:
      return { loading: true };
    case ORDER_SHIPPING_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case ORDER_SHIPPING_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case ORDER_SHIPPING_UPDATE_RESET:
      return {};
    case ORDER_CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};