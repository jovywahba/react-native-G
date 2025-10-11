// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBUkizwOA6_KRt9OmAPFC5wTGOtry4aLGo",
  authDomain: "react-native-g1.firebaseapp.com",
  projectId: "react-native-g1",
  storageBucket: "react-native-g1.firebasestorage.app", // لو واجهت مشكلة في التخزين جرّب: react-native-g1.appspot.com
  messagingSenderId: "1032298062665",
  appId: "1:1032298062665:web:146b280a60372adea47098",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ تهيئة Auth حسب المنصة
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
  // حافظ الجلسة في المتصفح
  setPersistence(auth, browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
