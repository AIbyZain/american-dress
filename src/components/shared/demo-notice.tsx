"use client";

import { Info } from "lucide-react";
import { useStoreData } from "@/context/store-data-context";
import { cn } from "@/lib/utils";

export function DemoNotice({ children, className }: { children?: React.ReactNode; className?: string }) {
  const { mode } = useStoreData();
  if (mode !== "demo") return null;
  return (
    <div className={cn("flex items-start gap-3 border border-gold/40 bg-ivory px-4 py-3 text-[13px] leading-relaxed text-ink", className)} role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
      <div>{children ?? "Demo mode: accounts, orders and changes are saved in this browser only. No payment is taken."}</div>
    </div>
  );
}
