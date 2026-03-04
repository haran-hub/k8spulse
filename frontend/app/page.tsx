"use client";
import { useCluster } from "@/hooks/useCluster";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { GaugeBar } from "@/components/GaugeBar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Server, Box, Rocket, Zap, Activity, AlertTriangle, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";

const MAX_HISTORY = 40;
interface Tick { t: number; cpu: number; mem: number }

export default function Dashboard() {
  const { summary, nodes, pods, hpas, events, connected } = useCluster();
  const [history, setHistory] = useState<Tick[]>([]);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!summary) return;
    tickRef.current += 1;
    setHistory(h => [
      ...h.slice(-(MAX_HISTORY - 1)),
      { t: tickRef.current, cpu: summary.avg_cpu_pct, mem: summary.avg_mem_pct },
    ]);
  }, [summary?.tick]);

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0a0e1a" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p style={{ color: "#4a6080" }}>Connecting to cluster...</p>
        </div>
      </div>
    );
  }

  const recentEvents = events.slice(0, 8);

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar connected={connected} health={summary.health} />

      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Cluster Overview</h1>
            <p className="text-sm mt-1" style={{ color: "#4a6080" }}>
              {summary.cluster.name} · {summary.cluster.provider} · {summary.cluster.region} · v{summary.cluster.version}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={summary.health} />
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#0f1629", border: "1px solid #1e2d52", color: "#4a6080" }}>
              <RefreshCw size={12} className="animate-spin" style={{ animationDuration: "4s" }} />
              Live · 3s
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Nodes"
            value={`${summary.nodes_ready}/${summary.nodes_total}`}
            sub={summary.nodes_ready < summary.nodes_total ? "⚠ Node unhealthy" : "All healthy"}
            color="#22c55e"
            icon={<Server size={16} />}
          />
          <StatCard
            label="Pods Running"
            value={summary.pods_running}
            sub={`${summary.pods_pending} pending · ${summary.pods_failed} failed`}
            color="#3b82f6"
            icon={<Box size={16} />}
            pulse={summary.pods_failed > 0}
          />
          <StatCard
            label="Deployments"
            value={summary.deployments}
            sub={summary.rolling_deploys > 0 ? `${summary.rolling_deploys} rolling update` : "All stable"}
            color="#a855f7"
            icon={<Rocket size={16} />}
          />
          <StatCard
            label="HPAs"
            value={summary.hpas}
            sub={summary.scaling_hpas > 0 ? `${summary.scaling_hpas} scaling` : "Stable"}
            color={summary.scaling_hpas > 0 ? "#eab308" : "#22c55e"}
            icon={<Zap size={16} />}
            pulse={summary.scaling_hpas > 0}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 rounded-xl p-5" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-white">Cluster Resource Usage</h2>
              <div className="flex gap-4 text-xs" style={{ color: "#4a6080" }}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded" style={{ background: "#3b82f6" }} />CPU</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded" style={{ background: "#a855f7" }} />Memory</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} tick={{ fill: "#4a6080", fontSize: 10 }} width={28} />
                <Tooltip
                  contentStyle={{ background: "#141c35", border: "1px solid #1e2d52", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ""}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, n: any) => [`${(v ?? 0).toFixed(1)}%`, n === "cpu" ? "CPU" : "Memory"] as [string, string]}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#gCpu)" dot={false} />
                <Area type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={2} fill="url(#gMem)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
            <h2 className="font-semibold text-sm text-white mb-4">Pod Status</h2>
            <div className="space-y-4">
              {[
                { label: "Running",          val: summary.pods_running, color: "#22c55e" },
                { label: "Pending",          val: summary.pods_pending, color: "#eab308" },
                { label: "CrashLoopBackOff", val: summary.pods_failed,  color: "#ef4444" },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#94a3b8" }}>{label}</span>
                    <span style={{ color }}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#1e2d52" }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${summary.pods_total ? (val / summary.pods_total) * 100 : 0}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #1e2d52" }}>
              <div className="text-xs mb-2" style={{ color: "#4a6080" }}>Namespaces</div>
              <div className="flex flex-wrap gap-1.5">
                {["production", "staging", "monitoring", "kube-system"].map(ns => (
                  <span key={ns} className="text-xs px-2 py-0.5 rounded" style={{ background: "#141c35", color: "#94a3b8", border: "1px solid #1e2d52" }}>
                    {ns}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nodes + Events */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 rounded-xl p-5" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
            <h2 className="font-semibold text-sm text-white mb-4">Nodes</h2>
            <div className="space-y-3">
              {nodes.map(node => (
                <div key={node.name} className="rounded-lg p-3" style={{ background: "#141c35", border: "1px solid #1e2d52" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium text-white">{node.name.split(".")[0]}</span>
                      <span className="ml-2 text-xs" style={{ color: "#4a6080" }}>{node.instance_type} · {node.zone}</span>
                    </div>
                    <StatusBadge status={node.status} small />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <GaugeBar label={`CPU (${node.vcpus} vCPU)`} pct={node.cpu_pct} />
                    <GaugeBar label={`Mem (${node.memory_gb} GB)`} pct={node.memory_pct} />
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: "#4a6080" }}>
                    {node.pods_running} pods · {node.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 rounded-xl p-5" style={{ background: "#0f1629", border: "1px solid #1e2d52" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-white">Recent Events</h2>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#141c35", color: "#4a6080" }}>
                {events.length} total
              </span>
            </div>
            <div className="space-y-2">
              {recentEvents.map((ev, i) => (
                <div key={i} className="rounded-lg p-2.5" style={{ background: "#141c35", border: "1px solid #1e2d52" }}>
                  <div className="flex items-start gap-2">
                    {ev.type === "Warning"
                      ? <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: "#f97316" }} />
                      : <Activity size={12} className="mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                    }
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: ev.type === "Warning" ? "#f97316" : "#e2e8f0" }}>
                        {ev.reason}
                      </div>
                      <div className="text-xs truncate mt-0.5" style={{ color: "#4a6080" }}>{ev.message}</div>
                    </div>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-xs" style={{ color: "#4a6080" }}>Waiting for events...</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 text-xs text-center" style={{ color: "#4a6080", borderTop: "1px solid #1e2d52" }}>
          K8s Pulse · Built by haran · Real-time Kubernetes cluster monitoring
        </div>
      </main>
    </div>
  );
}
