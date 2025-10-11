// src/screens/HomeScreen.js
import React, { useContext } from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile, logout } = useContext(AuthContext);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        {t("hello")}, {profile?.username}
      </Text>
      <Text>
        {t("user_type")}: {profile?.userType}
      </Text>
      <Button mode="outlined" onPress={logout} style={{ marginTop: 16 }}>
        {t("logout")}
      </Button>
    </View>
  );
}
