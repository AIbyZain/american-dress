/**
 * Customer reviews shown on the homepage, copied from the store's Google Maps listing.
 * `when` is the approximate month, worked out from Google's "x months ago" in October 2026.
 * Leave `rating` out to hide stars for a review.
 */
export interface Review {
  author: string;
  rating?: number;
  text: string;
  when: string;
  source: "google" | "demo";
}

export const reviews: Review[] = [
  {
    author: "Mudassir Ahmad",
    text: "Totally unprofessional staff. I got suits stitched from you. The fitting is very poor. It's too tight from the back, the button placement is incorrect, and it wrinkles badly when worn. Despite clearly explaining these issues, they have not been properly corrected. This has been a very disappointing experience. Will not come again.",
    when: "June 2026",
    source: "google",
  },
  {
    author: "Sadiq Iqbal",
    text: "Not satisfied at all. The coat has visible press marks and fabric damage that shouldn't be present in a new product. Looks worn and poorly maintained.",
    when: "May 2026",
    source: "google",
  },
  {
    author: "Ismail Khan",
    text: "I got my coat stitched from American Dress House, and the experience was very disappointing. The coat was poorly stitched, fitting was completely off, and despite explaining everything clearly, the final result was not worth the money at all. Their finishing, measurements, and overall workmanship need serious improvement. I trusted them with an important outfit, but unfortunately, they failed to deliver good quality. I hope they improve their service for future customers, but based on my experience, I cannot recommend them.",
    when: "December 2025",
    source: "google",
  },
];
