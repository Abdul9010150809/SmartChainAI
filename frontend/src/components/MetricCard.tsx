interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-2 text-3xl font-semibold text-ink">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}