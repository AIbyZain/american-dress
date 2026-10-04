import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      updated="October 2026"
      sections={[
        { h: "Orders", p: ["Placing an order is an offer to buy. An order is accepted when the store confirms it. We may cancel an order if an item is unavailable or a price was displayed in error, and will tell you if we do."] },
        { h: "Prices and payment", p: ["Prices are shown in Pakistani rupees and include applicable taxes unless stated. Payment is taken on delivery or at store pickup."] },
        { h: "Delivery", p: ["Delivery times are estimates and depend on the courier and your location. Risk passes to you on delivery."] },
        { h: "Exchanges", p: ["Unworn items with tags may be exchanged within 7 days of delivery. Altered and made-to-measure items cannot be exchanged. Confirm the current policy with the store."] },
        { h: "Product images", p: ["Colours on screen can vary slightly from the fabric. Embroidery and handwork may differ slightly between pieces."] },
      ]}
    />
  );
}
