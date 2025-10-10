// src/screens/AdminOrdersScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
  Modal,
  Portal,
  IconButton,
  Searchbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useOrders from "../hooks/useOrders";
import colors from "../constants/colors";

export default function AdminOrdersScreen() {
  const {
    orders,
    loading,
    error,
    counts,
    filterBy,
    moveNext,
    movePrev,
    getNextStatus,
    getPrevStatus,
    refresh,
    STATUS_FLOW,
  } = useOrders();

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const list = useMemo(() => {
    let filtered = filterBy(activeFilter);

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          (order.fullName || "").toLowerCase().includes(q) ||
          (order.status || "").toLowerCase().includes(q)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortDesc ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [activeFilter, filterBy, searchQuery, sortDesc]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const renderOrder = ({ item }) => {
    const next = getNextStatus(item.status || "Pending");
    const prev = getPrevStatus(item.status || "Pending");

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text
                style={styles.orderTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                #{item.orderNumber || item.id}
              </Text>
              <Text style={styles.subText}>{item.fullName || item.userId}</Text>
              <Text style={styles.subText}>Total: ${item.total}</Text>
            </View>

            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: statusColor(item.status) },
              ]}
              textStyle={{ color: "#fff", fontWeight: "700" }}
            >
              {item.status}
            </Chip>
          </View>

          <Text numberOfLines={2} style={[styles.small, { marginTop: 10 }]}>
            {item.address}
          </Text>

          <View style={styles.actions}>
            <Button
              icon="history"
              mode="outlined"
              onPress={() => setSelectedOrder(item)}
              style={styles.historyBtn}
            >
              History
            </Button>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="arrow-left"
                mode="contained-tonal"
                size={22}
                disabled={!prev}
                containerColor="#E0E0E0"
                onPress={() => movePrev(item)}
              />
              <IconButton
                icon="arrow-right"
                mode="contained"
                size={22}
                containerColor={colors.primary}
                iconColor="#fff"
                disabled={!next}
                onPress={() => moveNext(item)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  function statusColor(s) {
    switch ((s || "").toLowerCase()) {
      case "pending":
        return "#FFB74D";
      case "processing":
        return "#42A5F5";
      case "shipped":
        return "#7E57C2";
      case "delivered":
        return "#66BB6A";
      default:
        return "#9E9E9E";
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}> Orders Dashboard</Text>

        {/* search*/}
        <Searchbar
          placeholder="Search orders by ID, name, or status..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        {/* filter dashboard  */}
        <View style={styles.filtersContainer}>
          {["All", ...STATUS_FLOW].map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(f)}
                style={[
                  styles.filterCard,
                  {
                    backgroundColor: isActive ? statusColor(f) : "#fff",
                    shadowOpacity: isActive ? 0.25 : 0.1,
                    transform: [{ scale: isActive ? 1.05 : 1 }],
                  },
                ]}
              >
                <View style={styles.filterInner}>
                  <MaterialCommunityIcons
                    name="clipboard-list-outline"
                    size={20}
                    color={isActive ? "#fff" : statusColor(f)}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: isActive ? "#fff" : "#333" },
                    ]}
                  >
                    {f}
                  </Text>
                  {counts[f] !== undefined && (
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: isActive ? "#fff" : statusColor(f) },
                      ]}
                    >
                      <Text
                        style={{
                          color: isActive ? statusColor(f) : "#fff",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {counts[f]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* result counter*/}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            Showing {list.length} result{list.length !== 1 ? "s" : ""}
          </Text>
          <IconButton
            icon={sortDesc ? "sort-clock-descending" : "sort-clock-ascending"}
            size={22}
            onPress={() => setSortDesc(!sortDesc)}
            iconColor={colors.primary}
          />
        </View>

        {/* list*/}
        {loading ? (
          <View style={styles.center}>
            <Text>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>{error}</Text>
            <Button onPress={onRefresh}>Retry</Button>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.center}>
            <Text>No orders for "{activeFilter}"</Text>
            <Button onPress={onRefresh}>Refresh</Button>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(i) => i.id}
            renderItem={renderOrder}
            contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Modal */}
        <Portal>
          <Modal
            visible={!!selectedOrder}
            onDismiss={() => setSelectedOrder(null)}
            contentContainerStyle={styles.modal}
          >
            <Text style={{ fontWeight: "700", marginBottom: 8, fontSize: 16 }}>
              Order #{selectedOrder?.orderNumber || selectedOrder?.id}
            </Text>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              Status History
            </Text>

            {(selectedOrder?.statusHistory || [])
              .slice()
              .reverse()
              .map((h, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View
                    style={[
                      styles.historyDot,
                      { backgroundColor: statusColor(h.status) },
                    ]}
                  />
                  <View>
                    <Text style={{ fontWeight: "600" }}>{h.status}</Text>
                    <Text style={{ color: "#666", fontSize: 12 }}>
                      {new Date(h.changedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}

            <Button
              onPress={() => setSelectedOrder(null)}
              style={{ marginTop: 16 }}
            >
              Close
            </Button>
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, padding: 12 },
  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    color: "#263238",
  },
  searchBar: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  filterInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  filterLabel: { fontWeight: "700", fontSize: 15 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  resultsText: { color: "#555", fontWeight: "600" },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
    maxWidth: 180,
  },
  subText: { color: "#666", fontSize: 13 },
  small: { color: "#444", fontSize: 14 },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyBtn: { borderColor: "#ccc" },
  statusChip: { borderRadius: 8, paddingHorizontal: 6 },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  historyDot: { width: 12, height: 12, borderRadius: 6 },
  center: { alignItems: "center", justifyContent: "center", marginTop: 40 },
});
