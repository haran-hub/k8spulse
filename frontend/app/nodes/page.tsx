"use client";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { GaugeBar } from "@/components/GaugeBar";
import { Server } from "lucide-react";

export default function NodesPage() {
  const { nodes, summary, connected } = useCluster();

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary?.health} />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Server size={22} style={{ color: "#3b82f6" }} />
          <div>
            <h1 className="text-2xl font-bold text-white">Nodes</h1>
            <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
              {nodes.filter(n => n.status === "Ready").length}/{nodes.length} Ready
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {nodes.map(node => (
            <div key={node.name} className="rounded-xl p-6" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{node.name}</span>
                    <StatusBadge status={node.status} />
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#141c35", color: "#94a3b8", border: "1px solid #1e2d52" }}>
                      {node.role}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs" style={{ color: "#4a6080" }}>
                    <span>{node.instance_type}</span>
                    <span>{node.zone}</span>
                    <span>{node.os}</span>
                    <span>kubelet {node.kubelet_version}</span>
                  </div>
                </div>
                <div className="text-right text-xs" style={{ color: "#4a6080" }}>
                  <div>{node.pods_running} / {node.pods_capacity} pods</div>
                  <div>{node.vcpus} vCPUs · {node.memory_gb} GB RAM</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <GaugeBar label="CPU Usage" pct={node.cpu_pct} />
                <GaugeBar label="Memory Usage" pct={node.memory_pct} />
              </div>

              {/* Conditions */}
              <div className="flex flex-wrap gap-2">
                {node.conditions.map(c => (
                  <span
                    key={c.type}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: c.status === "False" && c.type !== "Ready" ? "rgba(34,197,94,0.1)" :
                                  c.type === "Ready" && c.status === "True" ? "rgba(34,197,94,0.1)" :
                                  "rgba(239,68,68,0.1)",
                      color: c.status === "False" && c.type !== "Ready" ? "#22c55e" :
                             c.type === "Ready" && c.status === "True" ? "#22c55e" : "#ef4444",
                      border: "1px solid currentColor",
                    }}
                  >
                    {c.type}: {c.status}
                  </span>
                ))}
              </div>

              <div className="mt-3 text-xs" style={{ color: "#4a6080" }}>
                {node.container_runtime} · Kernel {node.kernel_version} · Age {node.age_days}d
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
