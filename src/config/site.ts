/**
 * Business details for American Dress House.
 * Edit this file to update contact information shown across the site.
 */
export const siteConfig = {
  name: "American Dress House",
  shortName: "ADH",
  description:
    "Sherwanis, prince coats, suits and formal menswear from American Dress House, Bank Road, Saddar, Rawalpindi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  address: {
    line1: "Barkat Plaza, Shop No 14, 15, 16, 17",
    line2: "Bank Road, Saddar",
    city: "Rawalpindi",
    postalCode: "46000",
    country: "Pakistan",
  },
  phone: "051 5522031",
  phoneHref: "tel:+92515522031",
  geo: { lat: 33.5968621, lng: 73.0514394 },
  mapsUrl:
    "https://www.google.com/maps/place/American+Dress+House/@33.5968665,73.0488645,17z/data=!4m6!3m5!1s0x38df948357eec04f:0x989823faf96f2e88!8m2!3d33.5968621!4d73.0514394",
  mapEmbedUrl: "https://www.google.com/maps?q=33.5968621,73.0514394&z=17&output=embed",
  /** Public Google rating as provided by the business. Update when it changes. */
  googleRating: { value: 4.0, count: 3665 },
} as const;

export const mainNav = [
  { label: "Sherwanis", href: "/category/sherwanis" },
  { label: "Prince Coats", href: "/category/prince-coats" },
  { label: "Suits", href: "/category/suits" },
  { label: "Kurta Shalwar", href: "/category/kurta-shalwar" },
  { label: "Wedding Edit", href: "/collections/wedding-edit" },
  { label: "Shop all", href: "/shop" },
] as const;
