import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "ivory" }) {
  return (
    <Link href="/" className={cn("group inline-flex flex-col items-center leading-none", className)} aria-label="American Dress House, home">
      <span className={cn("font-serif text-[22px] tracking-[0.01em] md:text-[26px]", tone === "ivory" ? "text-ivory" : "text-ink")}>
        American Dress House
      </span>
      <span className="mt-1.5 flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-gold">
        <span className="h-px w-5 bg-gold/70" aria-hidden />
        Rawalpindi
        <span className="h-px w-5 bg-gold/70" aria-hidden />
      </span>
    </Link>
  );
}
