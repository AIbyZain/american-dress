import type { Order, OrderStatus, Product } from "@/types";

/** Deterministic pseudo-random generator so sample analytics stay stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const names = ["Sample Customer A", "Sample Customer B", "Sample Customer C", "Sample Customer D", "Sample Customer E", "Sample Customer F"];
const cities = ["Rawalpindi", "Islamabad", "Lahore", "Karachi", "Peshawar", "Faisalabad"];

/**
 * Generated SAMPLE orders used only to populate demo analytics.
 * They are flagged with isSample and are never real transactions.
 */
export function generateSampleOrders(products: Product[], now = new Date(), count = 28): Order[] {
  const rand = mulberry32(2026);
  const active = products.filter((p) => p.variants.length);
  if (!active.length) return [];
  const statuses: OrderStatus[] = ["delivered", "delivered", "delivered", "shipped", "processing", "confirmed", "pending", "cancelled"];
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const created = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(rand() * 36000000));
    const itemCount = 1 + Math.floor(rand() * 2);
    const items = Array.from({ length: itemCount }, () => {
      const p = active[Math.floor(rand() * active.length)];
      const v = p.variants[Math.floor(rand() * p.variants.length)];
      return {
        productId: p.id,
        variantId: v.id,
        name: p.name,
        size: v.size,
        color: v.color,
        image: p.images[0]?.url ?? null,
        unitPrice: v.priceOverride ?? p.price,
        quantity: 1 + Math.floor(rand() * 2),
      };
    });
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const shippingFee = subtotal >= 25000 ? 0 : 350;
    const ci = Math.floor(rand() * names.length);
    orders.push({
      id: `sample-${i + 1}`,
      number: `SAMPLE-${String(1001 + i)}`,
      userId: null,
      email: `sample${ci + 1}@example.com`,
      status: statuses[Math.floor(rand() * statuses.length)],
      paymentStatus: "unpaid",
      paymentMethod: rand() > 0.3 ? "cod" : "store_pickup",
      items,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      currency: "PKR",
      shippingAddress: {
        fullName: names[ci],
        phone: "0300 0000000",
        email: `sample${ci + 1}@example.com`,
        line1: "Sample address",
        city: cities[ci],
        province: "Punjab",
        country: "Pakistan",
      },
      createdAt: created.toISOString(),
      isDemo: true,
      isSample: true,
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
