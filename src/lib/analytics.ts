import type { Order } from "@/types";

const counted = (o: Order) => o.status !== "cancelled";

export function orderKpis(orders: Order[]) {
  const valid = orders.filter(counted);
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  return {
    revenue,
    orders: orders.length,
    avgOrder: valid.length ? revenue / valid.length : 0,
    units: valid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0),
    pending: orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
  };
}

export function revenueByDay(orders: Order[], days = 30, now = new Date()) {
  const buckets: { date: string; label: string; revenue: number; orders: number }[] = [];
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.push({ date: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: 0, orders: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const o of orders.filter(counted)) {
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const i = index.get(key) ?? index.get(o.createdAt.slice(0, 10));
    if (i === undefined) continue;
    buckets[i].revenue += o.total;
    buckets[i].orders += 1;
  }
  return buckets;
}

export function topProducts(orders: Order[], limit = 5) {
  const map = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders.filter(counted)) {
    for (const it of o.items) {
      const key = it.productId ?? it.name;
      const row = map.get(key) ?? { name: it.name, units: 0, revenue: 0 };
      row.units += it.quantity;
      row.revenue += it.unitPrice * it.quantity;
      map.set(key, row);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function statusCounts(orders: Order[]) {
  const counts: Record<string, number> = {};
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return counts;
}
