// src/screens/HomeScreen.js
import React, { useContext } from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { profile, logout } = useContext(AuthContext);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>Hello, {profile?.username}</Text>
      <Text>User type: {profile?.userType}</Text>
      <Button mode="outlined" onPress={logout} style={{ marginTop: 16 }}>Logout</Button>
    </View>
  );
}
