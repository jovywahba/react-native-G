import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  I18nManager,
  Platform,
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
import { useTranslation } from "react-i18next";

export default function AdminOrdersScreen() {
  const { t, i18n } = useTranslation();

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
  } = useOrders();

  // ✅ ثابت للحالات لضمان عمل الفلاتر حتى لو STATUS_FLOW مش متوفر من hook
  const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  // ✅ تحديث الاتجاه بعد تغيير اللغة
  useEffect(() => {
    const isArabic = i18n.language.startsWith("ar");
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
  }, [i18n.language]);

  // ✅ فلترة وعرض اللستة
  const list = useMemo(() => {
    let filtered = filterBy(activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(q) ||
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

  // scroll for update
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const statusColor = (s = "") => {
    const key = s.toString().toLowerCase();
    switch (key) {
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
  };

  //  oredr cart
  const renderOrder = ({ item }) => {
    const next = getNextStatus(item.status || "Pending");
    const prev = getPrevStatus(item.status || "Pending");

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.orderTitle} numberOfLines={1}>
                #{item.orderNumber || item.id}
              </Text>
              <Text style={styles.subText}>{item.fullName || item.userId}</Text>
              <Text style={styles.subText}>
                {t("total")}: ${item.total}
              </Text>
            </View>

            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: statusColor(item.status) },
              ]}
              textStyle={{ color: "#fff", fontWeight: "700" }}
            >
              {t(item.status?.toLowerCase?.() || "unknown")}
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
              {t("history")}
            </Button>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon={I18nManager.isRTL ? "arrow-right" : "arrow-left"}
                size={22}
                disabled={!prev}
                containerColor="#E0E0E0"
                onPress={() => movePrev(item)}
              />
              <IconButton
                icon={I18nManager.isRTL ? "arrow-left" : "arrow-right"}
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

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.container,
          { direction: I18nManager.isRTL ? "rtl" : "ltr" },
        ]}
      >
        <Text style={styles.header}>{t("orders_dashboard")}</Text>

        <Searchbar
          placeholder={t("search_placeholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        {/* status filter*/}
        <View style={styles.filtersContainer}>
          {["All", ...STATUS_FLOW].map((status) => {
            const statusKey =
              typeof status === "string" ? status.toLowerCase() : "unknown";
            const label = t(statusKey);
            const isActive = activeFilter === status;

            return (
              <TouchableOpacity
                key={status}
                onPress={() => setActiveFilter(status)}
                activeOpacity={0.8}
                style={[
                  styles.filterCard,
                  {
                    backgroundColor: isActive ? statusColor(status) : "#fff",
                    shadowOpacity: isActive ? 0.25 : 0.1,
                    transform: [{ scale: isActive ? 1.05 : 1 }],
                  },
                ]}
              >
                <View style={styles.filterInner}>
                  <MaterialCommunityIcons
                    name="filter-outline"
                    size={20}
                    color={isActive ? "#fff" : statusColor(status)}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: isActive ? "#fff" : "#333" },
                    ]}
                  >
                    {label}
                  </Text>

                  {counts?.[status] !== undefined && (
                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor: isActive
                            ? "#fff"
                            : statusColor(status),
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isActive ? statusColor(status) : "#fff",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {counts[status]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* results*/}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {t("showing")} {list.length} {t("results")}
          </Text>
          <IconButton
            icon={sortDesc ? "sort-clock-descending" : "sort-clock-ascending"}
            size={22}
            onPress={() => setSortDesc(!sortDesc)}
            iconColor={colors.primary}
          />
        </View>

        {/* oredr render*/}
        {loading ? (
          <View style={styles.center}>
            <Text>{t("loading_orders")}</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>{error}</Text>
            <Button onPress={onRefresh}>{t("retry")}</Button>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.center}>
            <Text>{t("no_orders")}</Text>
            <Button onPress={onRefresh}>{t("refresh")}</Button>
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

        {/* status history*/}
        <Portal>
          <Modal
            visible={!!selectedOrder}
            onDismiss={() => setSelectedOrder(null)}
            contentContainerStyle={styles.modal}
          >
            <Text style={{ fontWeight: "700", marginBottom: 8, fontSize: 16 }}>
              {t("order_id")}: #
              {selectedOrder?.orderNumber || selectedOrder?.id}
            </Text>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              {t("status_history")}
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
                    <Text style={{ fontWeight: "600" }}>
                      {t(h.status?.toLowerCase?.() || "unknown")}
                    </Text>
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
              {t("close")}
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
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 16,
    color: "#263238",
    textAlign: "center",
    paddingTop: -1000,
  },

  langBtn: { borderRadius: 10 },
  searchBar: { marginBottom: 12, borderRadius: 12, elevation: 2 },
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
