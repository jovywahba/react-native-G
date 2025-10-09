import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async () => {
    const user = getAuth().currentUser;
    if (!user) return [];
    const docRef = doc(db, "favorites", user.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().items || [] : [];
  }
);
export const toggleFavoriteInFirebase = createAsyncThunk(
  "favorites/toggleFavoriteInFirebase",
  async (productId, { getState }) => {
    const user = getAuth().currentUser;
    if (!user) 
        return [];
    const currentFavs = getState().favorites.items || [];
    let newFavs = [];

    if (currentFavs.includes(productId)) {
      newFavs = currentFavs.filter((id) => id !== productId);
    } else {
      newFavs = [...currentFavs, productId];
    }

    await setDoc(doc(db, "favorites", user.uid), { items: newFavs });
    return newFavs;
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { items: [], status: "idle" },
  reducers: {
    toggleFavoriteLocal: (state, action) => {
      const productId = action.payload;
      if (!Array.isArray(state.items)) {
        state.items = [];
      }

      if (state.items.includes(productId)) {
        state.items = state.items.filter((id) => id !== productId);
      } else {
        state.items.push(productId);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(toggleFavoriteInFirebase.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const { toggleFavoriteLocal, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
