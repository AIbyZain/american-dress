/**
 * Payment integration layer.
 *
 * The store currently takes orders without collecting payment online:
 * cash on delivery or payment at store pickup. No card data is handled anywhere.
 *
 * To add an online gateway later (for example a card processor or a local wallet):
 * 1. Implement `PaymentProvider` in a new file in this folder.
 * 2. Create payment sessions on the server only (route handler or server action),
 *    using secret keys from server-side environment variables.
 * 3. Confirm payment through the provider's webhook before marking an order as paid.
 * 4. Return it from `getPaymentProvider` for the new method id.
 */

export type PaymentMethodId = "cod" | "store_pickup";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export const paymentMethods: PaymentMethod[] = [
  { id: "cod", label: "Cash on delivery", description: "Pay the courier in cash when your order arrives." },
  { id: "store_pickup", label: "Pay at store pickup", description: "Collect and pay at Bank Road, Saddar, Rawalpindi." },
];

export interface PaymentIntentResult {
  status: "not_required" | "redirect" | "failed";
  redirectUrl?: string;
  message?: string;
}

export interface PaymentProvider {
  id: string;
  createPayment(input: { orderId: string; amount: number; currency: string }): Promise<PaymentIntentResult>;
}

/** Offline methods: nothing is charged online, the order is paid on delivery or pickup. */
export const offlinePaymentProvider: PaymentProvider = {
  id: "offline",
  async createPayment() {
    return { status: "not_required" };
  },
};

export function getPaymentProvider(method: PaymentMethodId): PaymentProvider {
  switch (method) {
    case "cod":
    case "store_pickup":
    default:
      return offlinePaymentProvider;
  }
}

export function paymentMethodLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}
