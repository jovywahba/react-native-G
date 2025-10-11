// src/screens/AdminProfileScreen.js
import React, { useContext } from "react";
import { View } from "react-native";
import { Text, Card, Avatar, Divider } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";

export default function AdminProfileScreen() {
  const { user, profile } = useContext(AuthContext);
  const displayName =
    profile?.username || profile?.name || user?.email?.split("@")[0] || "Admin";
  const email = user?.email || "-";
  const role = profile?.userType || "admin";

  const initial = (displayName?.[0] || "A").toUpperCase();

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#F7F7F7" }}>
      <Card style={{ borderRadius: 16, padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Avatar.Text label={initial} size={64} />
          <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 8 }}>
            {displayName}
          </Text>
          <Text style={{ color: "#666" }}>{email}</Text>
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <View style={{ gap: 8 }}>
          <Text>
            <Text style={{ fontWeight: "700" }}>Role: </Text>
            {role}
          </Text>
          {profile?.createdAt ? (
            <Text>
              <Text style={{ fontWeight: "700" }}>Joined: </Text>
              {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </Card>
    </View>
  );
}
