import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import CartItem from "../components/CartItem";
import CartFooter from "../components/CartFooter";
import { useTranslation } from "react-i18next";

const CartScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        if (isUpdating) return;
        const cartItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(cartItems);
      },
      (error) => console.error("Snapshot error:", error)
    );

    return () => unsubscribe();
  }, [isUpdating]);

  const handleQtyChange = async (id, delta) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const cartItem = items.find((i) => i.id === id);
      if (!cartItem) return;

      const productRef = doc(db, "products", cartItem.productId);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) return;

      const productData = productSnap.data();
      const currentStock = Number(productData.stock);
      const newQty = Number(cartItem.quantity) + delta;

      if (delta > 0 && newQty > currentStock) {
        Alert.alert(
          t("error"),
          t("insufficient_stock", { stock: currentStock })
        );
        return;
      }

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      );

      setIsUpdating(true);

      await updateDoc(doc(db, "cart", id), { quantity: newQty });

      await updateDoc(productRef, {
        stock: currentStock + (delta < 0 ? 1 : -1),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheck = async (id, checked) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !checked } : i))
      );

      setIsUpdating(true);
      await updateDoc(doc(db, "cart", id), { checked: !checked });
    } catch (error) {
      console.error("Error updating checked:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "cart", id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteChecked = async () => {
    const checkedItems = items.filter((i) => i.checked);
    if (checkedItems.length === 0) {
      Alert.alert(t("notice"), t("no_items_selected"));
      return;
    }

    Alert.alert(t("confirm"), t("delete_selected_items"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          setIsUpdating(true);
          for (const item of checkedItems) {
            await deleteDoc(doc(db, "cart", item.id));
          }
          setIsUpdating(false);
        },
      },
    ]);
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );

  const itemCount = items.length;

  return (
    <>
      <Appbar.Header
        style={{ backgroundColor: "#F9FAF9" }}
        mode="center-aligned"
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t("tabs_cart")} />
        <Appbar.Action icon="delete" onPress={handleDeleteChecked} />
      </Appbar.Header>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 180 }}
        >
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQtyChange={handleQtyChange}
              onCheck={() => handleCheck(item.id, item.checked)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </ScrollView>

        <CartFooter
          total={total}
          itemCount={itemCount}
          title={t("cart_proceed_checkout")}
          totaltext={t("cart_total")}
          textitem={`(${t("cart_items")})`}
          onCheckout={() => navigation.navigate("Checkout")}
        />
      </View>
    </>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAF9", padding: 10 },
});
