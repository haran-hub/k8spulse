interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

export function StatCard({ label, value, sub, color = "#3b82f6", icon, pulse }: Props) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: "#0f1629", border: "1px solid #1e2d52" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#4a6080" }}>
          {label}
        </span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color }}>
          {value}
        </span>
        {pulse && (
          <span className="mb-1 w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        )}
      </div>
      {sub && <span className="text-xs" style={{ color: "#4a6080" }}>{sub}</span>}
    </div>
  );
}
