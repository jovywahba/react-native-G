// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import ordersReducer from "./Redux/ordersSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ يمنع تحذير non-serializable values (مثل Firestore Timestamp)
    }),
});
