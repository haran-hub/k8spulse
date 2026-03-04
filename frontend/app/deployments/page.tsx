"use client";
import { useState } from "react";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Rocket, ChevronDown, ChevronUp, Clock } from "lucide-react";

export default function DeploymentsPage() {
  const { deployments, summary, connected } = useCluster();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ns, setNs] = useState("all");

  const filtered = ns === "all" ? deployments : deployments.filter(d => d.namespace === ns);
  const namespaces = ["all", ...Array.from(new Set(deployments.map(d => d.namespace)))];

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary?.health} />
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Rocket size={22} style={{ color: "#a855f7" }} />
            <div>
              <h1 className="text-2xl font-bold text-white">Deployments</h1>
              <p className="text-sm mt-0.5" style={{ color: "#4a6080" }}>
                {filtered.filter(d => d.rolling_update).length} rolling · {filtered.length} total
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {namespaces.map(n => (
              <button key={n} onClick={() => setNs(n)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: ns === n ? "rgba(168,85,247,0.15)" : "#0f1629",
                  color: ns === n ? "#a855f7" : "#4a6080",
                  border: `1px solid ${ns === n ? "#a855f7" : "#1e2d52"}`,
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(dep => {
            const key = `${dep.namespace}/${dep.name}`;
            const isOpen = expanded === key;
            const healthPct = dep.desired_replicas ? (dep.ready_replicas / dep.desired_replicas) * 100 : 0;

            return (
              <div key={key} className="rounded-xl" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
                {/* Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : key)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{dep.name}</span>
                        {dep.rolling_update && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full animate-pulse"
                            style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            Rolling Update
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#4a6080" }}>
                        {dep.namespace} · {dep.strategy} · Age {dep.age_days}d
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Replica progress */}
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs mb-1 text-right" style={{ color: "#4a6080" }}>
                          {dep.ready_replicas}/{dep.desired_replicas} ready
                        </div>
                        <div className="w-28 h-1.5 rounded-full" style={{ background: "#1e2d52" }}>
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${healthPct}%`, background: healthPct === 100 ? "#22c55e" : "#eab308" }} />
                        </div>
                      </div>
                      <StatusBadge status={dep.rolling_update ? "Pending" : "Running"} small />
                    </div>
                    {isOpen ? <ChevronUp size={16} style={{ color: "#4a6080" }} /> : <ChevronDown size={16} style={{ color: "#4a6080" }} />}
                  </div>
                </div>

                {/* Expanded: deploy history */}
                {isOpen && (
                  <div className="px-5 pb-5" style={{ borderTop: "1px solid #1e2d52" }}>
                    <div className="pt-4">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#4a6080" }}>
                        Deploy History
                      </div>
                      <div className="space-y-2">
                        {dep.history.map(rev => (
                          <div key={rev.revision} className="flex items-center gap-4 rounded-lg p-3"
                            style={{ background: "#141c35", border: "1px solid #1e2d52" }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: rev.status === "deployed" ? "rgba(34,197,94,0.15)" : "#1e2d52", color: rev.status === "deployed" ? "#22c55e" : "#4a6080" }}>
                              {rev.revision}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-medium">{dep.image}:{rev.version}</span>
                                <StatusBadge status={rev.status} small dot={false} />
                              </div>
                              <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#4a6080" }}>
                                <Clock size={10} />
                                {new Date(rev.deployed_at).toLocaleDateString()} by {rev.deployed_by}
                                {rev.change_cause && <span>· {rev.change_cause}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
