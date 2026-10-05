import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getStoreData } from "@/lib/services/store.server";
import { AppProviders } from "@/components/providers/app-providers";

const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "American Dress House | Sherwanis, Suits and Formal Menswear in Rawalpindi",
    template: "%s | American Dress House",
  },
  description: siteConfig.description,
  keywords: ["sherwani Rawalpindi", "prince coat", "groom wear", "men's suits Pakistan", "Saddar Bank Road", "American Dress House"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "American Dress House",
    description: siteConfig.description,
    locale: "en_PK",
    images: [{ url: "/images/maroon-velvet-sherwani.jpg", alt: "Maroon velvet zardozi sherwani" }],
  },
  twitter: { card: "summary_large_image", title: "American Dress House", description: siteConfig.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#171717", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The signed-in user is loaded in the browser, so store pages can be cached and served instantly.
  const data = await getStoreData();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AppProviders data={data} user={null}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
