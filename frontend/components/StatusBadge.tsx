const MAP: Record<string, { bg: string; text: string; dot: string }> = {
  Running:            { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Ready:              { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Healthy:            { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Stable:             { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  deployed:           { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Active:             { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Pending:            { bg: "rgba(234,179,8,0.12)",  text: "#eab308", dot: "#eab308" },
  ScaleUp:            { bg: "rgba(234,179,8,0.12)",  text: "#eab308", dot: "#eab308" },
  ScaleDown:          { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", dot: "#3b82f6" },
  CrashLoopBackOff:   { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", dot: "#ef4444" },
  Failed:             { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", dot: "#ef4444" },
  NotReady:           { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", dot: "#ef4444" },
  Degraded:           { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", dot: "#ef4444" },
  Warning:            { bg: "rgba(249,115,22,0.12)", text: "#f97316", dot: "#f97316" },
  superseded:         { bg: "rgba(74,96,128,0.2)",   text: "#94a3b8", dot: "#4a6080" },
};

interface Props { status: string; dot?: boolean; small?: boolean }

export function StatusBadge({ status, dot = true, small }: Props) {
  const s = MAP[status] ?? { bg: "rgba(74,96,128,0.2)", text: "#94a3b8", dot: "#94a3b8" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${small ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}`}
      style={{ background: s.bg, color: s.text }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />}
      {status}
    </span>
  );
}
