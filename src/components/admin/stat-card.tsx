export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {note ? <p className="mt-1 text-[12px] text-muted">{note}</p> : null}
    </div>
  );
}
