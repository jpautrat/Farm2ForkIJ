import axios from 'axios';
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

// API base URL
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Add item to cart
export const addToCart = (id, quantity = 1) => async (dispatch, getState) => {
  try {
    // Get product details from API
    const { data } = await axios.get(`${API_URL}/products/${id}`);

    // Check if product is in stock
    if (data.countInStock < quantity) {
      throw new Error(`Sorry, only ${data.countInStock} items available`);
    }

    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.salePrice || data.price,
        originalPrice: data.price,
        countInStock: data.countInStock,
        quantity,
        seller: data.seller ? {
          id: data.seller._id,
          name: data.seller.farmName || 'Farm2Fork Seller',
        } : null,
        isOrganic: data.isOrganic || false,
        weight: data.weight || 0,
        unit: data.unit || 'lb',
      },
    });

    // Calculate cart totals
    dispatch(calculateCartPrices());

    // Save cart to localStorage
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    // You could dispatch an error action here if needed
  }
};

// Remove item from cart
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  // Calculate cart totals
  dispatch(calculateCartPrices());

  // Save cart to localStorage
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

// Update item quantity in cart
export const updateCartItemQuantity = (id, quantity) => (dispatch, getState) => {
  // Get current cart items
  const { cartItems } = getState().cart;
  
  // Find the item
  const item = cartItems.find(item => item.product === id);
  
  // Check if quantity is valid
  if (!item || quantity <= 0 || quantity > item.countInStock) {
    return;
  }

  dispatch({
    type: CART_UPDATE_QUANTITY,
    payload: {
      id,
      quantity,
    },
  });

  // Calculate cart totals
  dispatch(calculateCartPrices());

  // Save cart to localStorage
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

// Clear cart
export const clearCart = () => (dispatch) => {
  dispatch({ type: CART_CLEAR_ITEMS });
  
  // Remove cart from localStorage
  localStorage.removeItem('cartItems');
};

// Save shipping address
export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  // Save shipping address to localStorage
  localStorage.setItem('shippingAddress', JSON.stringify(data));
  
  // If we have shipping address, we can get shipping rates
  if (data.postalCode) {
    dispatch(getShippingRates());
  }
};

// Save payment method
export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  // Save payment method to localStorage
  localStorage.setItem('paymentMethod', JSON.stringify(data));
};

// Calculate cart prices (subtotal, tax, shipping, total)
export const calculateCartPrices = () => (dispatch, getState) => {
  const { cartItems, shippingPrice, coupon } = getState().cart;
  
  // Calculate subtotal
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Calculate tax (assume 7% tax rate)
  const taxRate = 0.07;
  const taxPrice = itemsPrice * taxRate;
  
  // Calculate discount if coupon is applied
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discountAmount = (itemsPrice * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, itemsPrice); // Don't discount more than the subtotal
    }
  }
  
  // Calculate total
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;
  
  dispatch({
    type: CART_CALCULATE_PRICES,
    payload: {
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
    },
  });
};

// Apply coupon code
export const applyCoupon = (code) => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_APPLY_COUPON_REQUEST });

    // Get current cart subtotal
    const { itemsPrice } = getState().cart;

    // Call API to validate coupon
    const { data } = await axios.post(`${API_URL}/coupons/validate`, {
      code,
      cartTotal: itemsPrice,
    });

    dispatch({
      type: CART_APPLY_COUPON_SUCCESS,
      payload: data,
    });

    // Recalculate cart totals with coupon
    dispatch(calculateCartPrices());

    // Save coupon to localStorage
    localStorage.setItem('coupon', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: CART_APPLY_COUPON_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Remove coupon
export const removeCoupon = () => (dispatch) => {
  dispatch({ type: CART_REMOVE_COUPON });
  
  // Remove coupon from localStorage
  localStorage.removeItem('coupon');
  
  // Recalculate cart totals without coupon
  dispatch(calculateCartPrices());
};

// Get shipping rates
export const getShippingRates = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_GET_SHIPPING_RATES_REQUEST });

    const { shippingAddress, cartItems } = getState().cart;
    
    // If no shipping address, can't get rates
    if (!shippingAddress || !shippingAddress.postalCode) {
      throw new Error('Shipping address is required');
    }
    
    // Prepare items for shipping rate calculation
    const items = cartItems.map(item => ({
      id: item.product,
      quantity: item.quantity,
      weight: item.weight || 0,
      price: item.price,
    }));

    // Call API to get shipping rates
    const { data } = await axios.post(`${API_URL}/shipping/rates`, {
      destination: {
        postalCode: shippingAddress.postalCode,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
      },
      items,
    });

    dispatch({
      type: CART_GET_SHIPPING_RATES_SUCCESS,
      payload: data,
    });
    
    // If rates are returned and we don't have a selected rate yet, select the cheapest
    if (data.rates && data.rates.length > 0) {
      const cheapestRate = data.rates.reduce(
        (min, rate) => (rate.price < min.price ? rate : min),
        data.rates[0]
      );
      
      dispatch(selectShippingRate(cheapestRate));
    }
  } catch (error) {
    dispatch({
      type: CART_GET_SHIPPING_RATES_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Select shipping rate
export const selectShippingRate = (rate) => (dispatch, getState) => {
  dispatch({
    type: CART_SELECT_SHIPPING_RATE,
    payload: rate,
  });
  
  // Save selected shipping rate to localStorage
  localStorage.setItem('selectedShippingRate', JSON.stringify(rate));
  
  // Update shipping price in cart
  const shippingPrice = rate.price || 0;
  
  // Recalculate cart totals with new shipping price
  dispatch(calculateCartPrices());
};

// Clear cart error
export const clearCartError = () => (dispatch) => {
  dispatch({ type: CART_CLEAR_ERROR });
};

// Initialize cart from localStorage
export const initializeCart = () => (dispatch, getState) => {
  // Load cart items from localStorage
  const cartItems = localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [];
  
  // Load shipping address from localStorage
  const shippingAddress = localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {};
  
  // Load payment method from localStorage
  const paymentMethod = localStorage.getItem('paymentMethod')
    ? JSON.parse(localStorage.getItem('paymentMethod'))
    : '';
  
  // Load coupon from localStorage
  const coupon = localStorage.getItem('coupon')
    ? JSON.parse(localStorage.getItem('coupon'))
    : null;
  
  // Load selected shipping rate from localStorage
  const selectedShippingRate = localStorage.getItem('selectedShippingRate')
    ? JSON.parse(localStorage.getItem('selectedShippingRate'))
    : null;
  
  // Initialize cart state
  dispatch({
    type: CART_ADD_ITEM,
    payload: cartItems,
  });
  
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: shippingAddress,
  });
  
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: paymentMethod,
  });
  
  if (coupon) {
    dispatch({
      type: CART_APPLY_COUPON_SUCCESS,
      payload: coupon,
    });
  }
  
  if (selectedShippingRate) {
    dispatch({
      type: CART_SELECT_SHIPPING_RATE,
      payload: selectedShippingRate,
    });
  }
  
  // Calculate cart totals
  dispatch(calculateCartPrices());
};