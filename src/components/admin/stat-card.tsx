export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-5">
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
