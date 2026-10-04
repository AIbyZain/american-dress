import Link from "next/link";
import { StoreChrome } from "@/components/layout/store-chrome";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StoreChrome>
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-[120px] leading-none text-gold/60" aria-hidden>
          404
        </p>
        <h1 className="mt-4 font-serif text-4xl">This page isn't here</h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          The link may be old or the piece may have sold through. Search the store or start from the full collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/shop">Shop all products</Link>
          </Button>
          <Button asChild variant="subtle">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </StoreChrome>
  );
}
