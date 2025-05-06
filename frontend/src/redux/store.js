import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';

// Import reducers
import authReducer from './reducers/authReducer';
import {
  productListReducer,
  productDetailsReducer,
  productCreateReducer,
  productUpdateReducer,
  productDeleteReducer,
  productReviewCreateReducer,
  productTopReducer,
  productCategoryListReducer,
  productSearchReducer,
  productFilterReducer
} from './reducers/productReducer';
import cartReducer from './reducers/cartReducer';
import {
  orderCreateReducer,
  orderDetailsReducer,
  orderPayReducer,
  orderDeliverReducer,
  orderListMyReducer,
  orderListReducer,
  orderCancelReducer,
  orderRefundReducer,
  orderShippingUpdateReducer
} from './reducers/orderReducer';
import {
  userListReducer,
  userDetailsReducer,
  userUpdateReducer,
  userDeleteReducer,
  userAddressListReducer,
  userAddressCreateReducer,
  userAddressUpdateReducer,
  userAddressDeleteReducer,
  userAddressSetDefaultReducer,
  userSellerProfileReducer,
  userSellerProfileUpdateReducer,
  userWishlistReducer,
  userWishlistAddItemReducer,
  userWishlistRemoveItemReducer
} from './reducers/userReducer';

// Configure persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // only auth and cart will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productDelete: productDeleteReducer,
  productReviewCreate: productReviewCreateReducer,
  productTop: productTopReducer,
  productCategoryList: productCategoryListReducer,
  productSearch: productSearchReducer,
  productFilter: productFilterReducer,
  cart: cartReducer,

  // Order reducers
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderDeliver: orderDeliverReducer,
  orderListMy: orderListMyReducer,
  orderList: orderListReducer,
  orderCancel: orderCancelReducer,
  orderRefund: orderRefundReducer,
  orderShippingUpdate: orderShippingUpdateReducer,

  // User reducers
  userList: userListReducer,
  userDetails: userDetailsReducer,
  userUpdate: userUpdateReducer,
  userDelete: userDeleteReducer,
  userAddressList: userAddressListReducer,
  userAddressCreate: userAddressCreateReducer,
  userAddressUpdate: userAddressUpdateReducer,
  userAddressDelete: userAddressDeleteReducer,
  userAddressSetDefault: userAddressSetDefaultReducer,
  userSellerProfile: userSellerProfileReducer,
  userSellerProfileUpdate: userSellerProfileUpdateReducer,
  userWishlist: userWishlistReducer,
  userWishlistAddItem: userWishlistAddItemReducer,
  userWishlistRemoveItem: userWishlistRemoveItemReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
