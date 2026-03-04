"use client";
import { useState } from "react";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Box, CheckCircle, XCircle, Search } from "lucide-react";

const NS_OPTIONS = ["all", "production", "staging", "monitoring", "kube-system"];

export default function PodsPage() {
  const { pods, summary, connected } = useCluster();
  const [ns, setNs] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = pods
    .filter(p => ns === "all" || p.namespace === ns)
    .filter(p => !search || p.display_name.includes(search) || p.app.includes(search));

  const running = filtered.filter(p => p.status === "Running").length;
  const failed  = filtered.filter(p => p.status === "CrashLoopBackOff").length;

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary?.health} />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Box size={22} style={{ color: "#3b82f6" }} />
            <div>
              <h1 className="text-2xl font-bold text-white">Pods</h1>
              <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
                {running} running · {failed} failed · {filtered.length} total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
              <Search size={14} style={{ color: "#4a6080" }} />
              <input
                className="bg-transparent text-sm outline-none w-40"
                placeholder="Search pods..."
                style={{ color: "#e2e8f0" }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {NS_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setNs(n)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: ns === n ? "rgba(59,130,246,0.15)" : "#0f1629",
                    color: ns === n ? "#3b82f6" : "#4a6080",
                    border: `1px solid ${ns === n ? "#3b82f6" : "#1e2d52"}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e2d52" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#0f1629", borderBottom: "1px solid #1e2d52" }}>
                {["Pod", "Namespace", "Status", "Restarts", "CPU (m)", "Memory (MiB)", "Node", "Probes"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4a6080" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pod, i) => (
                <tr
                  key={pod.name}
                  style={{
                    background: i % 2 === 0 ? "#0a0e1a" : "#0d1220",
                    borderBottom: "1px solid #1e2d52",
                  }}
                  className="hover:bg-opacity-80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-white">{pod.display_name}</div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: "#4a6080" }}>{pod.image}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#141c35", color: "#94a3b8", border: "1px solid #1e2d52" }}>
                      {pod.namespace}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={pod.status} small /></td>
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: pod.restarts > 2 ? "#ef4444" : pod.restarts > 0 ? "#eab308" : "#22c55e" }}>
                      {pod.restarts}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: "#94a3b8" }}>{pod.cpu_millicores}m</td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: "#94a3b8" }}>{pod.memory_mib} Mi</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#4a6080" }}>{pod.node.split(".")[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs">
                        {pod.liveness_ok
                          ? <CheckCircle size={12} style={{ color: "#22c55e" }} />
                          : <XCircle size={12} style={{ color: "#ef4444" }} />
                        }
                        <span style={{ color: "#4a6080" }}>live</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        {pod.readiness_ok
                          ? <CheckCircle size={12} style={{ color: "#22c55e" }} />
                          : <XCircle size={12} style={{ color: "#ef4444" }} />
                        }
                        <span style={{ color: "#4a6080" }}>ready</span>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: "#4a6080" }}>No pods found</div>
          )}
        </div>
      </main>
    </div>
  );
}
