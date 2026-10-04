import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { ProductRail } from "@/components/home/product-rail";
import { BrandStory } from "@/components/home/brand-story";
import { CampaignBanner } from "@/components/home/campaign-banner";
import { FeaturedShowcase } from "@/components/home/featured-showcase";
import { ReviewsSection } from "@/components/home/reviews-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { siteConfig } from "@/config/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: siteConfig.name,
  telephone: "+92-51-5522031",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
    addressLocality: siteConfig.address.city,
    postalCode: siteConfig.address.postalCode,
    addressCountry: "PK",
  },
  geo: { "@type": "GeoCoordinates", latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng },
  url: siteConfig.url,
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <FeaturedCollections />
      <ProductRail id="bestsellers-heading" title="Bestsellers" intro="The pieces customers choose most, from wedding wear to everyday tailoring." href="/shop?sort=popular" pick="bestseller" tone="mist" />
      <BrandStory />
      <ProductRail id="new-heading" title="New arrivals" href="/shop?sort=newest" pick="new" />
      <CampaignBanner />
      <FeaturedShowcase />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
