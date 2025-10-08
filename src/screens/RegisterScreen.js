// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View } from "react-native";
import { Text, Button, TextInput, HelperText } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

const schema = Yup.object({
  username: Yup.string().trim().min(3).max(20)
    .matches(/^[a-z0-9_]+$/i, "Letters, numbers, _ only")
    .required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required(),
});

export default function RegisterScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    const usernameLower = values.username.toLowerCase();
    try {
      // 1) انشئ حساب
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(cred.user, { displayName: values.username });

      // 2) احجز اليوزرنيم (لو doc موجود أصلاً، القاعدة هتمنع create => ترمي خطأ)
      await setDoc(doc(db, "usernames", usernameLower), {
        uid: cred.user.uid,
        email: values.email, // علشان نستخدمه في اللوجين من غير قراءة users قبل Auth
      });

      // 3) أنشئ بروفايل اليوزر
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: values.email,
        username: values.username,
        usernameLower,
        userType: "user",
        createdAt: serverTimestamp(),
      });

      alert("Account created!");
    } catch (err) {
      // لو فشل حجز اليوزرنيم (موجود)، ممكن نعمل رولباك بسيط
      if (auth.currentUser) {
        try { await deleteDoc(doc(db, "users", auth.currentUser.uid)); } catch {}
      }
      alert(err.message.includes("PERMISSION_DENIED") || err.message.includes("already exists")
        ? "Username already taken, try another one."
        : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Create account</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput label="Username" mode="outlined" value={value} onChangeText={onChange} autoCapitalize="none" />
            <HelperText type="error" visible={!!errors.username}>{errors.username?.message}</HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput label="Email" mode="outlined" value={value} onChangeText={onChange}
                       keyboardType="email-address" autoCapitalize="none" />
            <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput label="Password" mode="outlined" value={value} onChangeText={onChange} secureTextEntry />
            <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput label="Confirm Password" mode="outlined" value={value} onChangeText={onChange} secureTextEntry />
            <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword?.message}</HelperText>
          </>
        )}
      />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting} style={{ marginTop: 8 }}>
        Register
      </Button>

      <Button mode="text" onPress={() => navigation.navigate("Login")} style={{ marginTop: 8 }}>
        Have an account? Login
      </Button>
    </View>
  );
}
