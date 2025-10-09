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
    if (!user) return [];

    const currentFavs = getState().favorites.items || [];
    let newFavs = [];

    if (currentFavs.includes(productId)) {
      newFavs = currentFavs.filter((id) => id !== productId);
    } else {
      newFavs = [...currentFavs, productId];
    }

    
    await setDoc(doc(db, "favorites", user.uid), { items: newFavs }, { merge: true });

    return newFavs;
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { items: [], status: "idle" },
  reducers: {
    // لحذف الفيفوريت عند تسجيل الخروج
    clearFavorites: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // عند تحميل الفيفوريت من فايربيز
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      // عند التبديل (إضافة/حذف) الفيفوريت
      .addCase(toggleFavoriteInFirebase.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
