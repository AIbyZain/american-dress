export function AuthCard({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="text-center font-serif text-4xl">{title}</h1>
        {intro ? <p className="mt-3 text-center text-[15px] text-muted">{intro}</p> : null}
        <div className="mt-10">{children}</div>
        {footer ? <div className="mt-8 border-t border-line pt-6 text-center text-[14px] text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
