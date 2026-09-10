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
    <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-5">
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="font-display text-3xl">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
