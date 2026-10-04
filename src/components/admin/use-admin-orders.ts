"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/types";
import { useStoreData } from "@/context/store-data-context";
import { fetchAdminOrders } from "@/lib/services/orders.client";

export function useAdminOrders() {
  const { mode, products, hydrated } = useStoreData();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!hydrated) return;
    fetchAdminOrders(mode, products)
      .then((o) => {
        setOrders(o);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Couldn't load orders.");
        setOrders([]);
      });
    // products only matter for generating demo samples; avoid refetching on every stock change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hydrated]);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, error, reload: load };
}
