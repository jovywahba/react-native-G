import React, { useEffect, useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Appbar, Text, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import CartItem from "../components/CartItem";
import CartFooter from "../components/CartFooter";

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const cartRef = query(
          collection(db, "cart"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(cartRef);

        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(cartItems);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    fetchCart();
  }, []);

  const total = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );
  }, [items]);

  const handleConfirmOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty.");
      return;
    }

    try {
      setLoading(true);


      const orderNumber = Math.floor(100000 + Math.random() * 900000); // رقم أوردر عشوائي
      const now = new Date().toISOString();

      const orderData = {
        userId: user.uid,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        total: Number(total) || 0,
        status: "Pending",
        orderNumber, 
        createdAt: now,
        items: items.map((i) => ({
          productId: i.productId || i.id || "unknown_product",
          name: i.name || "Unnamed Product",
          desc: i.desc || "",
          price: Number(i.price) || 0,
          quantity: Number(i.quantity) || 1,
          image: i.image || null,
        })),
        statusHistory: [
          {
            status: "Pending",
            changedAt: now,
          },
        ], 
      };

      
      await addDoc(collection(db, "orders"), orderData);

      
      for (const item of items) {
        await deleteDoc(doc(db, "cart", item.id));
      }

      navigation.navigate("Success");
    } catch (error) {
      console.error("Error confirming order:", error);
      Alert.alert("Error", "Something went wrong while confirming your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: "#fff" }} mode="center-aligned">
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Checkout" />
        <Appbar.Action
          icon="cart-outline"
          onPress={() => navigation.goBack()}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {items.map((item) => (
          <CartItem key={item.id} item={item} readonly />
        ))}

        <Text style={styles.formTitle}>Enter Shipping Details</Text>

        <TextInput
          label="Full Name*"
          mode="outlined"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter Full Name"
          style={styles.input}
          outlineColor="#E5E5E5"
          activeOutlineColor="#395457"
        />

        <TextInput
          label="Phone Number*"
          mode="outlined"
          value={phone}
          onChangeText={setPhone}
          placeholder="+20 ..."
          style={styles.input}
          outlineColor="#E5E5E5"
          activeOutlineColor="#395457"
          keyboardType="phone-pad"
        />

        <TextInput
          label="Address*"
          mode="outlined"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          style={styles.input}
          outlineColor="#E5E5E5"
          activeOutlineColor="#395457"
        />
      </ScrollView>

      <CartFooter
        title={loading ? "Processing..." : "Confirm Order"}
        totaltext="Total"
        total={total}
        onCheckout={handleConfirmOrder}
        textitem="(items)"
        itemCount={items.length}
      />
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#F9FAF9",
  },
});
