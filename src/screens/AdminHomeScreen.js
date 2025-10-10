// src/screens/AdminHomeScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import ProductItem from "../components/ProductItem";
import colors from "../constants/colors";

export default function AdminHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🟢 تحميل المنتجات
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
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
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background || "#F7F7F7",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary || "#2F4B4E"} />
        <Text style={{ marginTop: 10, color: colors.text || "#2F4B4E" }}>
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
   
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
            color: colors.primary || "#2F4B4E",
            marginBottom: 24,
          }}
        >
          Admin Dashboard
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Button
            mode="contained"
            onPress={() => navigation.navigate("AddProduct")}
            style={{
              flex: 1,
              borderRadius: 14,
              marginRight: 8,
              backgroundColor: colors.primary || "#2F4B4E",
              elevation: 2,
            }}
            contentStyle={{ height: 54 }}
            labelStyle={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
          >
            + Product
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate("AdminOrders")}
            style={{
              flex: 1,
              borderRadius: 14,
              borderColor: colors.primary || "#2F4B4E",
            }}
            contentStyle={{ height: 54 }}
            labelStyle={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.primary || "#2F4B4E",
            }}
          >
            Orders
          </Button>
        </View>

   
        <Card
          style={{
            borderRadius: 18,
            backgroundColor: "#fff",
            paddingVertical: 18,
            paddingHorizontal: 22,
            marginBottom: 24,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.primary || "#2F4B4E",
              marginBottom: 4,
            }}
          >
            Quick Overview
          </Text>
          <Divider style={{ marginVertical: 10 }} />
          <Text style={{ color: "#444", fontSize: 15 }}>
            Total Products:{" "}
            <Text style={{ fontWeight: "700" }}>{products.length}</Text>
          </Text>
          <Text style={{ color: "#444", fontSize: 15 }}>
            Orders: <Text style={{ fontWeight: "700" }}>View in "Orders"</Text>
          </Text>
        </Card>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
            color: colors.text || "#222",
          }}
        >
          Latest Products
        </Text>

        {products.length === 0 ? (
          <Card
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: "#fff",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#555", fontSize: 15 }}>
              No products yet. Tap “+ Product” to add.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 40,
            }}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <ProductItem item={item} style={{ marginBottom: 8 }} />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
