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
import { useTranslation } from "react-i18next";

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    username: Yup.string()
      .trim()
      .min(3)
      .max(20)
      .matches(/^[a-z0-9_]+$/i, t("letters_numbers_underscore_only"))
      .required(),
    email: Yup.string().email().required(),
    password: Yup.string().min(6).required(),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("passwords_must_match"))
      .required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    const usernameLower = values.username.toLowerCase();
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(cred.user, { displayName: values.username });

      await setDoc(doc(db, "usernames", usernameLower), {
        uid: cred.user.uid,
        email: values.email,
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: values.email,
        username: values.username,
        usernameLower,
        userType: "user",
        createdAt: serverTimestamp(),
      });

      alert(t("account_created"));
    } catch (err) {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, "users", auth.currentUser.uid));
        } catch {}
      }
      alert(
        err.message.includes("PERMISSION_DENIED") ||
          err.message.includes("already exists")
          ? t("username_already_taken")
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        {t("create_account")}
      </Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label={t("username")}
              mode="outlined"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
            <HelperText type="error" visible={!!errors.username}>
              {errors.username?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label={t("email")}
              mode="outlined"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label={t("password")}
              mode="outlined"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label={t("confirm_password")}
              mode="outlined"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword?.message}
            </HelperText>
          </>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        disabled={submitting}
        style={{ marginTop: 8 }}
      >
        {t("register")}
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 8 }}
      >
        {t("have_account_login")}
      </Button>
    </View>
  );
}
