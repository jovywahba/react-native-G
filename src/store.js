// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import ordersReducer from "./Redux/ordersSlice"; 

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    orders: ordersReducer, 
  },
});
