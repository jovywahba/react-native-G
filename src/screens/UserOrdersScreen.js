// src/screens/UserOrdersScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, ActivityIndicator, Chip } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function UserOrdersScreen() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#9E9E9E";
      case "processing":
        return "#2196F3";
      case "shipped":
        return "#FF9800";
      case "delivered":
        return "#4CAF50";
      default:
        return "#607D8B";
    }
  };

  const filteredOrders =
    selectedFilter === "All"
      ? orders
      : orders.filter(
          (order) =>
            order.status?.toLowerCase() === selectedFilter.toLowerCase()
        );

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Loading your orders...
        </Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* ✅ العنوان */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1E293B",
            marginBottom: 16,
          }}
        >
          My Orders
        </Text>

        {/* ✅ فلاتر الحالات */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {["All", "Pending", "Processing", "Shipped", "Delivered"].map(
            (status) => (
              <Chip
                key={status}
                selected={selectedFilter === status}
                onPress={() => setSelectedFilter(status)}
                style={{
                  backgroundColor:
                    selectedFilter === status ? "#607D8B" : "#E2E8F0",
                }}
                textStyle={{
                  color: selectedFilter === status ? "#FFF" : "#334155",
                  fontWeight: "600",
                }}
              >
                {status}
              </Chip>
            )
          )}
        </View>

        {/* req content*/}
        {filteredOrders.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
            }}
          >
            <Text style={{ fontSize: 18, color: "#94A3B8", marginBottom: 8 }}>
              No orders found
            </Text>
            <Text style={{ color: "#64748B" }}>
              Try selecting another filter.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card
                style={{
                  marginBottom: 16,
                  borderRadius: 16,
                  backgroundColor: "#FFFFFF",
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  overflow: "hidden",
                }}
              >
                <Card.Content style={{ paddingVertical: 14 }}>
                  {/* titile&status*/}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        color: "#1E293B",
                      }}
                    >
                      Order #{item.id.slice(0, 8)}...
                    </Text>
                    <View
                      style={{
                        backgroundColor: getStatusColor(item.status),
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        {item.status || "Pending"}
                      </Text>
                    </View>
                  </View>

                  {/* products */}
                  {item.items && item.items.length > 0 && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Image
                        source={{ uri: item.items[0].image }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 10,
                          marginRight: 10,
                          backgroundColor: "#F1F5F9",
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: "#334155",
                          }}
                        >
                          {item.items[0].name}
                        </Text>
                        <Text style={{ color: "#64748B", fontSize: 13 }}>
                          + {item.items.length - 1} more items
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* details */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: "#475569", marginBottom: 2 }}>
                      Total:{" "}
                      <Text style={{ fontWeight: "600" }}>${item.total}</Text>
                    </Text>
                    <Text style={{ color: "#64748B" }}>
                      Date:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
