import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { faqs } from "@/data/faq";

export const metadata: Metadata = { title: "FAQ and sizing", description: "Sizing, delivery, payment and exchanges at American Dress House." };

const sizeRows = [
  ["38", "36–38 in", "S"],
  ["40", "38–40 in", "M"],
  ["42", "40–42 in", "L"],
  ["44", "42–44 in", "XL"],
  ["46", "44–46 in", "XXL"],
];

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Questions and sizing" crumbs={[{ label: "FAQ" }]} />
      <section className="container grid gap-14 py-16 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-xl">
                {f.q}
                <span className="mt-1 text-xl text-muted transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/80">{f.a}</p>
            </details>
          ))}
        </div>
        <aside id="size-guide" aria-labelledby="size-heading">
          <h2 id="size-heading" className="font-serif text-2xl">
            Size guide
          </h2>
          <p className="mt-2 text-[14px] text-muted">Measure around the fullest part of the chest, under the arms. Guide only; ask in store for a fitting.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <caption className="sr-only">Chest sizes for sherwanis, suits and prince coats</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="py-2.5 font-medium">Jacket size</th>
                  <th scope="col" className="py-2.5 font-medium">Chest</th>
                  <th scope="col" className="py-2.5 font-medium">Kurta / waistcoat</th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((r) => (
                  <tr key={r[0]} className="border-b border-line">
                    {r.map((c, i) => (
                      <td key={i} className="py-2.5">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </section>
    </>
  );
}
