import React, { useEffect, useState } from "react";
import { View, FlatList, I18nManager } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { db } from "../firebase";
import {
  collection,
  orderBy,
  query,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites, toggleFavoriteInFirebase } from "../favoritesSlice";

import Header from "../components/Header";
import SearchBox from "../components/SearchBox";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import colors from "../constants/colors";
import { useTranslation } from "react-i18next";

export default function UserHomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items || []);
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;

  // RTL setup
  useEffect(() => {
    if (i18n.language === "ar") {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, [i18n.language]);

// Initial load of products
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"),orderBy("createdAt", "desc"),limit(4));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setProducts(data);
        setFiltered(data);
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === 4);
      } catch (e) {
        console.log("Error loading products:", e);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);


  //load more products for pagination
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, "products"),orderBy("createdAt", "desc"),startAfter(lastDoc),limit(4));
      const snap = await getDocs(q);
      const newData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts((prev) => [...prev, ...newData]);
      setFiltered((prev) => [...prev, ...newData]);
      if (snap.docs.length < 4) {
        setHasMore(false);
      } else {
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }
    } catch (e) {
      console.log("Error loading more products:", e);
    } finally {
      setLoadingMore(false);
    }
  };

//Favorites 
  useEffect(() => {
    if (user) dispatch(fetchFavorites());
  }, [user, dispatch]);

  const handleSearch = (text) => {
    setSearch(text);
    filterProducts(text, selected);
  };

  const filterProducts = (searchText, category) => {
    let data = [...products];
    if (category !== "All") {
      data = data.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      data = data.filter((item) => item.name.toLowerCase().includes(s));
    }
    setFiltered(data);
  };

  const handleCategoryChange = (cat) => {
    setSelected(cat);
    filterProducts(search, cat);
  };

  const handleAddToCart = async (item) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "cart"), {
        userId: userId,
        productId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: 1,
        checked: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.log("Error adding to cart:", error);
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (!userId) return;
    try {
      const cartQuery = query(
        collection(db, "cart"),
        where("userId", "==", userId),
        where("productId", "==", item.id)
      );
      const snapshot = await getDocs(cartQuery);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "cart", docSnap.id));
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  useEffect(() => {
    const favoritesCount = favorites?.length || 0;
    navigation.setOptions({
      tabBarBadge: favoritesCount > 0 ? favoritesCount : undefined,
    });
  }, [favorites, navigation]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        direction: i18n.language === "ar" ? "rtl" : "ltr",
      }}
    >
      <Header />
      <SearchBox
        search={search}
        setSearch={handleSearch}
        placeholder={t("search_placeholder")}
      />

      <Text
        variant="titleMedium"
        style={{
          marginBottom: 10,
          color: colors.text,
          textAlign: i18n.language === "ar" ? "right" : "left",
        }}
      >
        {t("categories")}
      </Text>

      <CategoryList
        selected={selected}
        setSelected={handleCategoryChange}
        translate={t}
      />

      {filtered.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: colors.grayText,
            marginTop: 30,
          }}
        >
          {t("no_products_found")}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: 16, marginHorizontal: 4 }}>
              <ProductCard
                item={item}
                onAddToCart={() => handleAddToCart(item)}
                onRemoveFromCart={() => handleRemoveFromCart(item)}
                onPress={() =>
                  navigation.navigate("DetailsScreen", { product: item })
                }
                favorites={favorites}
                onToggleFavorite={(id) =>
                  dispatch(toggleFavoriteInFirebase(id))
                }
                translate={t}
              />
            </View>
          )}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
