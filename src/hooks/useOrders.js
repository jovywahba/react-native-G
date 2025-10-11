import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import {
  setOrders,
  setLoading,
  setError,
  updateOrderLocal,
  updateOrderStatusOnServer,
  fetchOrdersOnce,
} from "../Redux/ordersSlice";
import { useTranslation } from "react-i18next";

// ⚙️ الحالات الأساسية (بالإنجليزية فقط)
const BASE_STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

export default function useOrders() {
  const dispatch = useDispatch();
  const { t } = useTranslation(); // ⬅️ إضافة الترجمة هنا

  const {
    items = [],
    loading = false,
    error = null,
  } = useSelector(
    (state) => state.orders || { items: [], loading: false, error: null }
  );

  useEffect(() => {
    dispatch(setLoading(true));
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        dispatch(setOrders(list));
        dispatch(setLoading(false));
      },
      (err) => {
        dispatch(setError(err.message || "Failed to listen orders"));
        dispatch(setLoading(false));
      }
    );

    return () => unsub();
  }, [dispatch]);

  // ✅ عدادات الحالات
  const counts = useMemo(() => {
    const map = { All: items.length };
    BASE_STATUS_FLOW.forEach((s) => (map[s] = 0));
    items.forEach((o) => {
      const s = o.status || "Pending";
      if (map[s] !== undefined) map[s] += 1;
    });
    return map;
  }, [items]);

  // ✅ فلترة الطلبات
  const filterBy = useCallback(
    (status) => {
      if (!status || status === "All") return items;
      return items.filter((o) => (o.status || "Pending") === status);
    },
    [items]
  );

  // ✅ الحالات التالية والسابقة
  const getNextStatus = useCallback((current) => {
    const idx = BASE_STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < BASE_STATUS_FLOW.length - 1
      ? BASE_STATUS_FLOW[idx + 1]
      : null;
  }, []);

  const getPrevStatus = useCallback((current) => {
    const idx = BASE_STATUS_FLOW.indexOf(current);
    return idx > 0 ? BASE_STATUS_FLOW[idx - 1] : null;
  }, []);

  // ✅ تغيير الحالة
  const changeStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        const changedAt = new Date().toISOString();
        dispatch(updateOrderLocal({ orderId, newStatus, changedAt }));
        await dispatch(
          updateOrderStatusOnServer({ orderId, newStatus })
        ).unwrap();
      } catch (err) {
        console.error("Failed to change status:", err);
        dispatch(setError(err || "Failed to update status"));
      }
    },
    [dispatch]
  );

  const moveNext = useCallback(
    (order) => {
      const next = getNextStatus(order.status || "Pending");
      if (!next) return null;
      return changeStatus(order.id, next);
    },
    [changeStatus, getNextStatus]
  );

  const movePrev = useCallback(
    (order) => {
      const prev = getPrevStatus(order.status || "Pending");
      if (!prev) return null;
      return changeStatus(order.id, prev);
    },
    [changeStatus, getPrevStatus]
  );

  // ✅ تحديث يدوي
  const refresh = useCallback(() => {
    dispatch(fetchOrdersOnce());
  }, [dispatch]);

  // 🈯 تحويل الحالات لترجمة (للاستخدام في الفلتر)
  const STATUS_FLOW = BASE_STATUS_FLOW.map((status) => ({
    key: status,
    label: t(status.toLowerCase()), // ⬅️ هنا الترجمة
  }));

  return {
    orders: items,
    loading,
    error,
    counts,
    filterBy,
    changeStatus,
    moveNext,
    movePrev,
    getNextStatus,
    getPrevStatus,
    refresh,
    STATUS_FLOW,
  };
}
