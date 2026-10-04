"use client";

import { useState } from "react";
import type { ProductImage } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 ? (
        <ul className="flex gap-3 md:flex-col" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === index}
                className={cn("relative block aspect-[4/5] w-16 overflow-hidden bg-mist md:w-20", i === index ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100")}
              >
                <SmartImage src={img.url} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-mist">
        <SmartImage src={current?.url} alt={current?.alt ?? name} label={name} priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
    </div>
  );
}
