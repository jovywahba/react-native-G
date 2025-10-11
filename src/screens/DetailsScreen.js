import * as React from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text, Button, IconButton, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavoriteInFirebase, fetchFavorites } from "../favoritesSlice";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const DetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items || []);
  const userAuth = getAuth();
  const user = userAuth.currentUser;

  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState("#4E8C7E");

  const isFav = favorites.includes(product.id);

  const toggleFavorite = async () => {
    if (!user) return;
    try {
      await dispatch(toggleFavoriteInFirebase(product.id)).unwrap();
      await dispatch(fetchFavorites());
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

        <View style={styles.topIcons}>
          <IconButton
            icon="arrow-left"
            size={22}
            style={styles.icon}
            onPress={() => navigation.goBack()}
          />

          <TouchableOpacity onPress={toggleFavorite} style={styles.heartIcon}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? "red" : "#455A64"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{product.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{product.category || "الفئة"}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Divider style={{ marginVertical: 15 }} />

        <Text style={styles.sectionTitle}>اللون</Text>
        <View style={styles.colorRow}>
          {["#4E8C7E", "#B0B0B0", "#E53935"].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 2 : 0,
                  borderColor: "#4E8C7E",
                },
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.counterText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          style={styles.cartButton}
          labelStyle={{ fontSize: 16 }}
          onPress={async () => {
            if (!user) return;

            await setDoc(doc(db, "cart", `${user.uid}_${product.id}`), {
              userId: user.uid,
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: quantity,
              selectedColor: selectedColor,
              createdAt: new Date(),
            });

            navigation.navigate("Cart");
          }}
        >
          أضف إلى السلة ${product.price * quantity}
        </Button>
      </View>
    </ScrollView>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: { backgroundColor: "#F5F7F9", flex: 1 },
  imageContainer: { alignItems: "center", marginTop: 20 },
  productImage: { width: 250, height: 250, resizeMode: "contain" },
  topIcons: {
    position: "absolute",
    top: 10,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: { backgroundColor: "white", margin: 0 },
  heartIcon: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  detailsContainer: {
    backgroundColor: "white",
    marginTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  rating: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, color: "#264653" },
  subtitle: { color: "#9E9E9E", marginBottom: 10 },
  description: { color: "#607D8B", lineHeight: 20 },
  sectionTitle: { color: "#264653", fontWeight: "bold", marginBottom: 10 },
  colorRow: { flexDirection: "row", gap: 10 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginVertical: 20,
    gap: 10,
  },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 18, color: "#264653" },
  quantityText: { fontSize: 16, fontWeight: "bold", color: "#264653" },
  cartButton: {
    backgroundColor: "#264653",
    borderRadius: 20,
    paddingVertical: 6,
  },
});
