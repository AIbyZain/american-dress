import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-label", {
  variants: {
    variant: {
      default: "bg-ink text-white",
      ivory: "bg-ivory text-ink",
      outline: "border border-line text-ink",
      gold: "bg-gold/15 text-gold-dark",
      success: "bg-success/10 text-success",
      danger: "bg-danger/10 text-danger",
      muted: "bg-mist text-muted",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
