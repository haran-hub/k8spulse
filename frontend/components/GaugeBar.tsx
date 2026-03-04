interface Props {
  label: string;
  pct: number;
  color?: string;
}

export function GaugeBar({ label, pct, color }: Props) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  const barColor = color ?? (pct > 85 ? "#ef4444" : pct > 70 ? "#eab308" : "#22c55e");

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color: barColor }}>{clampedPct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#1e2d52" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${clampedPct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
