import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const fetchFavorites = createAsyncThunk("favorites/fetchFavorites", async () => {
  const user = getAuth().currentUser;
  if (!user) return [];
  const snap = await getDoc(doc(db, "favorites", user.uid));
  return snap.exists() ? snap.data().items || [] : [];
});

export const toggleFavoriteInFirebase = createAsyncThunk(
"favorites/toggleFavoriteInFirebase",
  async (productId, { getState }) => {
    const user = getAuth().currentUser;
    if (!user) return [];
    const { items } = getState().favorites;
    const newFavs = items.includes(productId)
      ? items.filter((id) => id !== productId)
      : [...items, productId];
    await setDoc(doc(db, "favorites", user.uid), { items: newFavs }, { merge: true });
    return newFavs;
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { items: [] },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleFavoriteInFirebase.fulfilled, (state, action) => {
        state.items = action.payload || [];
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;