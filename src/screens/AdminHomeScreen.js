// src/screens/AdminHomeScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import ProductItem from "../components/ProductItem";

export default function AdminHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f7f7f7" }}>
      {/* زر كبير ومتمركز في الأعلى */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddProduct")}
        style={{ alignSelf: "center", width: "90%", borderRadius: 16, marginBottom: 16 }}
        contentStyle={{ height: 56 }}          // ارتفاع كبير للزر
        labelStyle={{ fontSize: 18, fontWeight: "700" }}
      >
        Add Product
      </Button>

      {/* (اختياري) عنوان */}
      <Text variant="titleLarge" style={{ fontWeight: "700", marginBottom: 12, textAlign: "center" }}>
        Admin Dashboard
      </Text>

      {products.length === 0 ? (
        <Card style={{ borderRadius: 16, padding: 16 }}>
          <Text>No products yet. Tap “Add Product”.</Text>
        </Card>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: 24,
            alignItems: "center", // يوسّط الكروت بعرض 400
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <ProductItem item={item} />}
        />
      )}
    </View>
  );
}
