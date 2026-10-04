/**
 * Customer reviews shown on the homepage.
 *
 * The entries below are DEMO CONTENT. They are not real reviews of American Dress House.
 * To show real Google reviews, copy them (with the reviewer's permission where needed)
 * into this list and set `source: "google"`. Demo entries are labelled on the page.
 */
export interface Review {
  author: string;
  rating: number;
  text: string;
  when: string;
  source: "google" | "demo";
}

export const reviews: Review[] = [
  {
    author: "Demo customer",
    rating: 5,
    text: "Staff helped me match a waistcoat to my kurta for my brother's mehndi and had the length adjusted the same week.",
    when: "Sample",
    source: "demo",
  },
  {
    author: "Demo customer",
    rating: 5,
    text: "Tried several sherwanis before the baraat. The fit after alterations was exactly what I wanted.",
    when: "Sample",
    source: "demo",
  },
  {
    author: "Demo customer",
    rating: 4,
    text: "Good range of suits in different price points. Busy on weekends, so visit early.",
    when: "Sample",
    source: "demo",
  },
  {
    author: "Demo customer",
    rating: 5,
    text: "Bought a navy suit and shirt for an interview. They took time to explain sizing.",
    when: "Sample",
    source: "demo",
  },
  {
    author: "Demo customer",
    rating: 4,
    text: "Embroidery on the prince coat was neat and the colour matched the photos.",
    when: "Sample",
    source: "demo",
  },
];
