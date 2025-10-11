// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: { identifier: "", password: "" },
  });

  const signIn = async ({ identifier, password }) => {
    setLoading(true);
    try {
      let emailToUse = identifier;

      if (!identifier.includes("@")) {
        // username → هات الإيميل من usernames
        const uname = identifier.toLowerCase();
        const snap = await getDoc(doc(db, "usernames", uname));
        if (!snap.exists()) {
          alert(t("username_not_found"));
          return;
        }
        emailToUse = snap.data().email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      // RootNavigator هيوجه حسب userType (من users) تلقائي بعد اللوجين
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        {t("welcome_back")}
      </Text>

      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label={t("email_or_username")}
            mode="outlined"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            placeholder={t("email_or_username_placeholder")}
            style={{ marginBottom: 12 }}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label={t("password")}
            mode="outlined"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={{ marginBottom: 12 }}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(signIn)}
        loading={loading}
        disabled={loading}
      >
        {t("login")}
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 8 }}
      >
        {t("create_new_account")}
      </Button>
    </View>
  );
}
