import { PageHeader } from "./page-header";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <>
      <PageHeader title={title} crumbs={[{ label: title }]} />
      <article className="container max-w-3xl py-14">
        <p className="border-l border-gold pl-4 text-[13px] text-muted">
          Template text, last updated {updated}. Have it reviewed by a legal adviser before the store goes live.
        </p>
        {sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-serif text-2xl">{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i} className="mt-3 text-[15px] leading-[1.8] text-ink/80">
                {t}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
