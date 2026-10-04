"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "left" | "right" | "top"; title: string; hideTitle?: boolean }
>(({ className, children, side = "right", title, hideTitle, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col bg-white shadow-[0_0_40px_rgba(23,23,23,0.12)] transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
        side === "right" && "inset-y-0 right-0 h-full w-full max-w-md data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        side === "left" && "inset-y-0 left-0 h-full w-[86%] max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        side === "top" && "inset-x-0 top-0 w-full data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        className,
      )}
      {...props}
    >
      <div className={cn("flex items-center justify-between border-b border-line px-5 py-4", hideTitle && "sr-only")}>
        <DialogPrimitive.Title className="font-serif text-xl">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Close className="p-1 text-ink hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Close">
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      </div>
      <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
