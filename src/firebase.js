// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ ضع هنا الـ config الخاص بمشروعك في Firebase Console → Project settings → Web app
const firebaseConfig = {
  apiKey: "AIzaSyBUkizwOA6_KRt9OmAPFC5wTGOtry4aLGo",
  authDomain: "react-native-g1.firebaseapp.com",
  projectId: "react-native-g1",
  storageBucket: "react-native-g1.firebasestorage.app",
  messagingSenderId: "1032298062665",
  appId: "1:1032298062665:web:146b280a60372adea47098"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
