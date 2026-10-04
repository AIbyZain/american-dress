"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPTIMIZED_HOSTS = ["images.unsplash.com"];

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return OPTIMIZED_HOSTS.includes(host) || host.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

interface SmartImageProps {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Text shown on the placeholder when no image can be loaded. */
  label?: string;
}

/** Fills its (relative) parent. Falls back to a second image, then to a branded placeholder. */
export function SmartImage({ src, alt, fallbackSrc, sizes = "(min-width: 1024px) 25vw, 50vw", priority, className, label }: SmartImageProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(src ? 0 : fallbackSrc ? 1 : 2);

  useEffect(() => {
    setStage(src ? 0 : fallbackSrc ? 1 : 2);
  }, [src, fallbackSrc]);

  const current = stage === 0 ? src : stage === 1 ? fallbackSrc : null;

  if (!current) {
    return (
      <div role="img" aria-label={alt} className={cn("absolute inset-0 flex flex-col items-center justify-center bg-ivory", className)}>
        <span className="font-serif text-3xl text-gold-dark" aria-hidden>
          ADH
        </span>
        {label ? (
          <span className="mt-3 max-w-[80%] text-center text-xs leading-relaxed text-muted" aria-hidden>
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!canOptimize(current)}
      className={cn("object-cover", className)}
      onError={() => setStage((s) => (s === 0 && fallbackSrc ? 1 : 2))}
    />
  );
}
