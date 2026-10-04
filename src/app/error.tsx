"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="font-serif text-4xl">This page didn't load</h1>
      <p className="mt-3 max-w-md text-[15px] text-muted">A temporary problem stopped the page from loading. Try again, or go back to the home page.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="subtle">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
