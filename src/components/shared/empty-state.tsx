import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      {icon ? <div className="mb-5 text-gold-dark">{icon}</div> : null}
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{body}</p>
      {action ? (
        <Button asChild className="mt-7">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
