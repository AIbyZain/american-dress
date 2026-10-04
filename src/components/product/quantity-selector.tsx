"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  size = "default",
  label = "Quantity",
}: {
  value: number;
  onChange(n: number): void;
  max: number;
  min?: number;
  size?: "default" | "sm";
  label?: string;
}) {
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={cn("inline-flex items-center border border-line", h)} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn("flex items-center justify-center px-3 text-ink disabled:text-line", h)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-[14px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn("flex items-center justify-center px-3 text-ink disabled:text-line", h)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
