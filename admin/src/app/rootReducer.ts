import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import categoryReducer from '../features/categories/categorySlice';
import brandReducer from '../features/brands/brandSlice';
import orderReducer from '../features/orders/orderSlice';
import userReducer from '../features/users/userSlice';
import uiReducer from '../features/ui/uiSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  categories: categoryReducer,
  brands: brandReducer,
  orders: orderReducer,
  users: userReducer,
  ui: uiReducer,
});
