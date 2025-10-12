// src/screens/AdminHomeScreen.js
import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { View, FlatList, RefreshControl, Alert, Platform } from "react-native";
import { Text, Button, ActivityIndicator, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { supabase, SUPABASE_BUCKET } from "../supabase";
import colors from "../constants/colors";
import AdminProductCard from "../components/AdminProductCard";

export default function AdminHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Dashboard",
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <IconButton icon="account-circle" onPress={() => navigation.navigate("AdminProfile")} />
          <IconButton
            icon="logout"
            onPress={async () => {
              try { await signOut(auth); } catch (e) { Alert.alert("Error", e?.message || "Sign out failed"); }
            }}
          />
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  const handleDelete = useCallback((item) => {
    Alert.alert("Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "products", item.id));
            if (item.imagePath) {
              await supabase.storage.from(SUPABASE_BUCKET).remove([item.imagePath]).catch(() => {});
            }
            setProducts((prev) => prev.filter((p) => p.id !== item.id));
          } catch (e) {
            Alert.alert("Error", e?.message || "Delete failed");
          }
        },
      },
    ]);
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, marginBottom: 16 }}>
      <AdminProductCard
        item={item}
        onPress={() => navigation.navigate("EditProduct", { id: item.id })}
        onEdit={() => navigation.navigate("EditProduct", { id: item.id })}
        onDelete={handleDelete}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background || "#F7F7F7" }}
      >
        <ActivityIndicator size="large" color={colors.primary || "#2F4B4E"} />
        <Text style={{ marginTop: 8, color: colors.text || "#2F4B4E" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.primary, marginBottom: 12 }}>
          Admin Dashboard
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Button mode="contained" onPress={() => navigation.navigate("AddProduct")} style={{ flex: 1, borderRadius: 12 }}>
            + Product
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate("AdminOrders")} style={{ flex: 1, borderRadius: 12 }}>
            Orders
          </Button>
        </View>

        <Text style={{ color: "#555", marginBottom: 8 }}>
          Total Products: <Text style={{ fontWeight: "700" }}>{products.length}</Text>
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(it) => it.id}
        numColumns={Platform.OS === "web" ? 2 : 1}
        columnWrapperStyle={Platform.OS === "web" ? { gap: 16, paddingHorizontal: 16 } : undefined}
        contentContainerStyle={{ paddingHorizontal: Platform.OS === "web" ? 0 : 16, paddingBottom: 24 }}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}
