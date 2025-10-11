// src/context/AuthContext.js
import React, { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { username, userType, email, ... }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(u);
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // ✨ أنشئ بروفايل افتراضي لو مش موجود
          const username =
            u.displayName ||
            (u.email ? u.email.split("@")[0] : `user_${u.uid.slice(0, 6)}`);

          const newProfile = {
            uid: u.uid,
            email: u.email || "",
            username,
            usernameLower: username.toLowerCase(),
            userType: "user",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // المستخدم مسموح له يكتب وثيقته حسب القواعد
          await setDoc(ref, newProfile);

          // عيّنها محليًا فورًا (createdAt هيبقى Timestamp لاحقًا)
          setProfile({ ...newProfile });
        } else {
          setProfile(snap.data());
        }
      } catch (e) {
        console.warn("Auth bootstrap error:", e?.message);
        // ما نحبسّش التنقل لو حصلت مشكلة قراءة البروفايل
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      logout: () => signOut(auth),
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
