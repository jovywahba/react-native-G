import React, { useState } from "react";
import { View } from "react-native";
import { Text, Button, TextInput, HelperText, Snackbar } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { identifier: "", password: "" },
    mode: "onTouched",
  });

  const signIn = async ({ identifier, password }) => {
    setLoading(true);
    setErr("");
    try {
      const id = (identifier || "").trim();
      if (!id) { setError("identifier", { message: "Required" }); return; }
      if (!password || password.length < 6) { setError("password", { message: "Min 6 chars" }); return; }

      let email = id;
      if (!id.includes("@")) {
        if (id.length < 3) { setError("identifier", { message: "Invalid username" }); return; }
        const snap = await getDoc(doc(db, "usernames", id.toLowerCase()));
        if (!snap.exists()) { setError("identifier", { message: "Username not found" }); return; }
        email = snap.data()?.email || "";
        if (!email) { setError("identifier", { message: "Account mapping error" }); return; }
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const m = e?.message || "Login failed";
      setErr(m);
      setError("password", { message: m });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Welcome back</Text>

      <Controller
        control={control}
        name="identifier"
        rules={{ required: "Required" }}
        render={({ field: { onChange, value, onBlur } }) => (
          <>
            <TextInput
              label="Email or username"
              mode="outlined"
              value={value}
              onChangeText={(t) => { setErr(""); onChange(t); }}
              onBlur={onBlur}
              autoCapitalize="none"
              style={{ marginBottom: 4 }}
            />
            <HelperText type="error" visible={!!errors.identifier}>
              {errors.identifier?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "Required", minLength: { value: 6, message: "Min 6 chars" } }}
        render={({ field: { onChange, value, onBlur } }) => (
          <>
            <TextInput
              label="Password"
              mode="outlined"
              value={value}
              onChangeText={(t) => { setErr(""); onChange(t); }}
              onBlur={onBlur}
              secureTextEntry
              style={{ marginTop: 8, marginBottom: 4 }}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>
          </>
        )}
      />

      <Button mode="contained" onPress={handleSubmit(signIn)} loading={loading} disabled={loading}>
        Login
      </Button>

      <Button mode="text" onPress={() => navigation.navigate("Register")} style={{ marginTop: 8 }}>
        Create new account
      </Button>

      <Snackbar visible={!!err} onDismiss={() => setErr("")} duration={3000} style={{ backgroundColor: "#d32f2f" }}>
        {err}
      </Snackbar>
    </View>
  );
}
