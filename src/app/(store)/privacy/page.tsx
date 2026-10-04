import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="October 2026"
      sections={[
        { h: "What we collect", p: ["When you create an account or place an order we collect your name, email address, phone number and delivery address, plus the items you order.", "We do not collect or store card details on this website."] },
        { h: "How we use it", p: ["To process and deliver orders, contact you about them, and keep your order history in your account.", "If you subscribe to emails, to tell you about new arrivals. You can unsubscribe at any time."] },
        { h: "Who we share it with", p: ["Couriers receive the details needed to deliver your order. Our hosting and database providers process data on our behalf. We do not sell personal data."] },
        { h: "Cookies and local storage", p: ["The site uses essential cookies to keep you signed in and stores your bag and wishlist in your browser so they persist between visits."] },
        { h: "Your choices", p: [`You can update your profile from your account, or ask us to delete your data by calling ${siteConfig.phone} or visiting the store.`] },
      ]}
    />
  );
}
