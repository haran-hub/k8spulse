"use client";
import { useState } from "react";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { Calendar, AlertTriangle, Activity } from "lucide-react";

export default function EventsPage() {
  const { events, summary, connected } = useCluster();
  const [filter, setFilter] = useState<"all" | "Warning" | "Normal">("all");

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const warnings = events.filter(e => e.type === "Warning").length;

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary?.health} />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar size={22} style={{ color: "#94a3b8" }} />
            <div>
              <h1 className="text-2xl font-bold text-white">Events</h1>
              <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
                {warnings} warnings · {events.length} total
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {(["all", "Warning", "Normal"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: filter === f ? (f === "Warning" ? "rgba(249,115,22,0.15)" : f === "Normal" ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.15)") : "#0f1629",
                  color: filter === f ? (f === "Warning" ? "#f97316" : f === "Normal" ? "#22c55e" : "#3b82f6") : "#4a6080",
                  border: `1px solid ${filter === f ? (f === "Warning" ? "#f97316" : f === "Normal" ? "#22c55e" : "#3b82f6") : "#1e2d52"}`,
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl p-4"
              style={{ background: "#0f1629", border: `1px solid ${ev.type === "Warning" ? "rgba(249,115,22,0.2)" : "#1e2d52"}` }}>
              <div className="mt-0.5 shrink-0">
                {ev.type === "Warning"
                  ? <AlertTriangle size={16} style={{ color: "#f97316" }} />
                  : <Activity size={16} style={{ color: "#22c55e" }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-sm" style={{ color: ev.type === "Warning" ? "#f97316" : "#e2e8f0" }}>
                    {ev.reason}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#141c35", color: "#94a3b8", border: "1px solid #1e2d52" }}>
                    {ev.namespace}
                  </span>
                  <span className="text-xs" style={{ color: "#4a6080" }}>{ev.object}</span>
                </div>
                <p className="text-sm" style={{ color: "#94a3b8" }}>{ev.message}</p>
              </div>
              <div className="text-xs shrink-0" style={{ color: "#4a6080" }}>
                {new Date(ev.timestamp).toLocaleTimeString()}
                {ev.count > 1 && <span className="ml-2 px-1.5 py-0.5 rounded" style={{ background: "#1e2d52", color: "#94a3b8" }}>×{ev.count}</span>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm" style={{ color: "#4a6080" }}>
              No events yet — they stream in every few seconds
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
