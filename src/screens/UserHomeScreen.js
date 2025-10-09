import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import Header from "../components/Header";
import SearchBox from "../components/SearchBox";
import CategoryList from "../components/CategoryList";
import ProductCard from "../components/ProductCard";
import colors from "../constants/colors";

export default function UserHomeScreen() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser; 
  const userId = user?.uid;

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    filterProducts(text, selected);
  };

  const filterProducts = (searchText, category) => {
    let data = [...products];

    if (category !== "All") {
      data = data.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === category.toLowerCase()
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

  if (loading)
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

  const handleAddToCart = async (item) => {
    if (!userId) {
      return;
    }

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
      
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Header />

      <SearchBox search={search} setSearch={handleSearch} />

      <Text
        variant="titleMedium"
        style={{ marginBottom: 10, color: colors.text }}
      >
        Categories
      </Text>

      <CategoryList selected={selected} setSelected={handleCategoryChange} />

      {filtered.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: colors.grayText,
            marginTop: 30,
          }}
        >
          No products found
        </Text>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: 16, marginHorizontal: 4 }}>
              <ProductCard item={item} onAddToCart={handleAddToCart} />
            </View>
          )}
        />
      )}
    </View>
  );
}
