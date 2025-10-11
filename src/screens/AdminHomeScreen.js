// src/screens/AdminHomeScreen.js
import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Divider,
  IconButton,
} from "react-native-paper";
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

export default function AdminHomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ⬅️ خلّي أزرار البروفايل/الخروج في هيدر الستاك
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Dashboard",
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="account-circle"
            onPress={() => navigation.navigate("AdminProfile")}
            accessibilityLabel="Profile"
          />
          <IconButton
            icon="logout"
            onPress={async () => {
              try {
                await signOut(auth);
              } catch (e) {
                Alert.alert("Error", e?.message || "Sign out failed");
              }
            }}
            accessibilityLabel="Sign out"
          />
        </View>
      ),
    });
  }, [navigation]);

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

  const handleDelete = useCallback(async (product) => {
    Alert.alert("Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "products", product.id));
            if (product.imagePath) {
              await supabase.storage
                .from(SUPABASE_BUCKET)
                .remove([product.imagePath])
                .catch(() => {});
            }
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
          } catch (e) {
            console.error(e);
            Alert.alert("Error", e.message || "Delete failed");
          }
        },
      },
    ]);
  }, []);

  const ProductCard = ({ item }) => (
    <Card style={{ borderRadius: 12, overflow: "hidden", backgroundColor: "#fff" }}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      ) : null}

      <Card.Title
        title={item.name}
        subtitle={`$${item.price} • ${item.category || "-"}`}
        right={(props) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              {...props}
              icon="pencil"
              onPress={() => navigation.navigate("EditProduct", { id: item.id })}
              accessibilityLabel="Edit product"
            />
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDelete(item)}
              accessibilityLabel="Delete product"
            />
          </View>
        )}
      />
      <Card.Content style={{ paddingTop: 0 }}>
        {!!item.description && (
          <Text style={{ color: "#444" }} numberOfLines={3}>
            {item.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            Total Products: <Text style={{ fontWeight: "700" }}>{products.length}</Text>
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
            contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
            scrollEnabled={false}
            renderItem={({ item }) => <ProductCard item={item} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
