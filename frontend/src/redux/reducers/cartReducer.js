import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_UPDATE_QUANTITY,
  CART_CLEAR_ITEMS,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CALCULATE_PRICES,
  CART_APPLY_COUPON_REQUEST,
  CART_APPLY_COUPON_SUCCESS,
  CART_APPLY_COUPON_FAIL,
  CART_REMOVE_COUPON,
  CART_GET_SHIPPING_RATES_REQUEST,
  CART_GET_SHIPPING_RATES_SUCCESS,
  CART_GET_SHIPPING_RATES_FAIL,
  CART_SELECT_SHIPPING_RATE,
  CART_CLEAR_ERROR
} from '../constants/cartConstants';

// Initial state
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  discountAmount: 0,
  totalPrice: 0,
  coupon: null,
  couponLoading: false,
  couponError: null,
  shippingRates: [],
  shippingRatesLoading: false,
  shippingRatesError: null,
  selectedShippingRate: null,
  error: null
};

// Cart reducer
const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      // Check if the item is already in the cart
      const existingItem = state.cartItems.find(
        (item) => item.product === action.payload.product
      );

      if (existingItem) {
        // If item exists, update quantity
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item.product === existingItem.product
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        // If item doesn't exist, add it to cart
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }

    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.product !== action.payload
        ),
      };

    case CART_UPDATE_QUANTITY:
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.product === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case CART_CLEAR_ITEMS:
      return {
        ...state,
        cartItems: [],
        itemsPrice: 0,
        taxPrice: 0,
        shippingPrice: 0,
        discountAmount: 0,
        totalPrice: 0,
        coupon: null,
      };

    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };

    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case CART_CALCULATE_PRICES:
      return {
        ...state,
        itemsPrice: action.payload.itemsPrice,
        taxPrice: action.payload.taxPrice,
        shippingPrice: action.payload.shippingPrice,
        discountAmount: action.payload.discountAmount,
        totalPrice: action.payload.totalPrice,
      };

    case CART_APPLY_COUPON_REQUEST:
      return {
        ...state,
        couponLoading: true,
        couponError: null,
      };

    case CART_APPLY_COUPON_SUCCESS:
      return {
        ...state,
        coupon: action.payload,
        couponLoading: false,
        couponError: null,
      };

    case CART_APPLY_COUPON_FAIL:
      return {
        ...state,
        couponLoading: false,
        couponError: action.payload,
      };

    case CART_REMOVE_COUPON:
      return {
        ...state,
        coupon: null,
        discountAmount: 0,
      };

    case CART_GET_SHIPPING_RATES_REQUEST:
      return {
        ...state,
        shippingRatesLoading: true,
        shippingRatesError: null,
      };

    case CART_GET_SHIPPING_RATES_SUCCESS:
      return {
        ...state,
        shippingRates: action.payload.rates || [],
        shippingRatesLoading: false,
        shippingRatesError: null,
      };

    case CART_GET_SHIPPING_RATES_FAIL:
      return {
        ...state,
        shippingRatesLoading: false,
        shippingRatesError: action.payload,
      };

    case CART_SELECT_SHIPPING_RATE:
      return {
        ...state,
        selectedShippingRate: action.payload,
        shippingPrice: action.payload.price || 0,
      };

    case CART_CLEAR_ERROR:
      return {
        ...state,
        error: null,
        couponError: null,
        shippingRatesError: null,
      };

    default:
      return state;
  }
};

export default cartReducer;