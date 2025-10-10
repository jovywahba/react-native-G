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

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

export default function useOrders() {
  const dispatch = useDispatch();
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

  // عدادات لكل حالة + all
  const counts = useMemo(() => {
    const map = { All: items.length };
    STATUS_FLOW.forEach((s) => (map[s] = 0));
    items.forEach((o) => {
      const s = o.status || "Pending";
      if (map[s] !== undefined) map[s] += 1;
    });
    return map; // { All: x, Pending: y, ... }
  }, [items]);

  // فلترة
  const filterBy = useCallback(
    (status) => {
      if (!status || status === "All") return items;
      return items.filter((o) => (o.status || "Pending") === status);
    },
    [items]
  );

  // next/prev status calculation
  const getNextStatus = useCallback((current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1
      ? STATUS_FLOW[idx + 1]
      : null;
  }, []);
  const getPrevStatus = useCallback((current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx > 0 ? STATUS_FLOW[idx - 1] : null;
  }, []);

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

  // helper: move forward / backward (if possible)
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

  // manual refresh (fallback): fetch once
  const refresh = useCallback(() => {
    dispatch(fetchOrdersOnce());
  }, [dispatch]);

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
