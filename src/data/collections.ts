import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    slug: "wedding-edit",
    name: "The Wedding Edit",
    description: "Sherwanis, prince coats and tuxedos for the baraat, the walima and every event between.",
    image: "/images/maroon-velvet-sherwani.jpg",
  },
  {
    slug: "formal-tailoring",
    name: "Formal Tailoring",
    description: "Suits, shirts and ties for the office, the interview and the dinner after.",
    image: "/images/grey-check-suit.jpg",
  },
  {
    slug: "festive-edit",
    name: "Festive Edit",
    description: "Kurta shalwar, waistcoats and prince coats for mehndi, Eid and family occasions.",
    image: "/images/ivory-jamawar-detail.jpg",
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug) ?? null;
}
