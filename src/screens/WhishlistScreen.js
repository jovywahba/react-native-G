// src/screens/WhishlistScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchFavorites, toggleFavoriteInFirebase } from "../favoritesSlice";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";

export default function WishlistScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const favorites = useSelector((state) => state.favorites.items || []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب جميع المنتجات
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // جلب الفيفوريت من Firebase عند التحميل
  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 40,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        ListHeaderComponent={
          <View style={{ alignItems: "center", marginBottom: 25 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#264653",
                letterSpacing: 1,
              }}
            >
              {t("tabs_favorites")}
            </Text>
            <View
              style={{
                width: 60,
                height: 3,
                backgroundColor: "#2A9D8F",
                marginTop: 6,
                borderRadius: 2,
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("DetailsScreen", { product: item })
                }
              >
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => dispatch(toggleFavoriteInFirebase(item.id))}
              >
                <Ionicons
                  name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={favorites.includes(item.id) ? "red" : "#455A64"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.info}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>{`${item.price} $`}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 2,
    shadowColor: "#ccc",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: { position: "relative" },
  image: {
    width: "100%",
    height: 130,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  info: { padding: 10 },
  title: { fontSize: 15, fontWeight: "600", color: "#1B1B1B" },
  price: { fontSize: 15, fontWeight: "700", color: "#1B1B1B", marginTop: 4 },
});
