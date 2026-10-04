/**
 * Browser storage for demo mode. Nothing here reaches a server or database.
 * Data lives only in this browser and can be cleared from Admin → Settings.
 */
export const STORAGE_KEYS = {
  cart: "adh.cart.v1",
  wishlist: "adh.wishlist.v1",
  catalog: "adh.demo.catalog.v1",
  settings: "adh.demo.settings.v1",
  orders: "adh.demo.orders.v1",
  users: "adh.demo.users.v1",
  session: "adh.demo.session.v1",
  newsletter: "adh.demo.newsletter.v1",
  sampleStatus: "adh.demo.sample-status.v1",
} as const;

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; demo keeps working in memory.
  }
}

export function removeLocal(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function clearDemoData() {
  [STORAGE_KEYS.catalog, STORAGE_KEYS.settings, STORAGE_KEYS.orders, STORAGE_KEYS.users, STORAGE_KEYS.session, STORAGE_KEYS.newsletter, STORAGE_KEYS.sampleStatus].forEach(removeLocal);
}
