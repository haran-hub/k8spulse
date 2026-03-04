"use client";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { GaugeBar } from "@/components/GaugeBar";
import { Zap } from "lucide-react";

export default function HPAPage() {
  const { hpas, summary, connected } = useCluster();

  const scaling = hpas.filter(h => h.scaling_status !== "Stable").length;

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary?.health} />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Zap size={22} style={{ color: "#eab308" }} />
          <div>
            <h1 className="text-2xl font-bold text-white">Horizontal Pod Autoscalers</h1>
            <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
              {scaling} scaling · {hpas.length} total
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hpas.map(hpa => {
            const scalePct = Math.min(100, ((hpa.current_replicas - hpa.min_replicas) / Math.max(1, hpa.max_replicas - hpa.min_replicas)) * 100);

            return (
              <div key={hpa.name} className="rounded-xl p-5" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-white">{hpa.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
                      {hpa.namespace} · targets: {hpa.deployment}
                    </div>
                  </div>
                  <StatusBadge status={hpa.scaling_status} />
                </div>

                {/* Replica range */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2" style={{ color: "#94a3b8" }}>
                    <span>Replicas: <strong className="text-white">{hpa.current_replicas}</strong></span>
                    <span>min {hpa.min_replicas} · max {hpa.max_replicas}</span>
                  </div>
                  <div className="relative h-2 rounded-full" style={{ background: "#1e2d52" }}>
                    <div className="absolute h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${scalePct}%`,
                        background: hpa.scaling_status === "ScaleUp" ? "#eab308" :
                                    hpa.scaling_status === "ScaleDown" ? "#3b82f6" : "#22c55e",
                      }} />
                    {/* min/max markers */}
                    <div className="absolute left-0 top-3 text-xs" style={{ color: "#4a6080" }}>{hpa.min_replicas}</div>
                    <div className="absolute right-0 top-3 text-xs" style={{ color: "#4a6080" }}>{hpa.max_replicas}</div>
                  </div>
                </div>

                {/* CPU metric */}
                <div className="mt-5">
                  <GaugeBar
                    label={`CPU utilization (target ${hpa.target_pct}%)`}
                    pct={hpa.current_pct}
                    color={hpa.current_pct > hpa.target_pct * 1.15 ? "#eab308" : "#22c55e"}
                  />
                </div>

                {/* Target line indicator */}
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "#4a6080" }}>
                  <span className="w-4 h-0.5" style={{ background: "#3b82f6" }} />
                  Target {hpa.target_pct}% · Current {hpa.current_pct.toFixed(1)}%
                  · Last scale {new Date(hpa.last_scale_time).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
