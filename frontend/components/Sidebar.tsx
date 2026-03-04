"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, Box, Rocket, Zap,
  Calendar, Network, Activity,
} from "lucide-react";

const NAV = [
  { href: "/",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/nodes",       label: "Nodes",       icon: Server },
  { href: "/pods",        label: "Pods",        icon: Box },
  { href: "/deployments", label: "Deployments", icon: Rocket },
  { href: "/hpa",         label: "HPA",         icon: Zap },
  { href: "/events",      label: "Events",      icon: Calendar },
];

interface Props {
  connected: boolean;
  health?: string;
}

export function Sidebar({ connected, health }: Props) {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col" style={{ background: "#0f1629", borderRight: "1px solid #1e2d52" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #1e2d52" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#1e40af)" }}>
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm leading-tight">K8s Pulse</div>
          <div className="text-xs" style={{ color: "#4a6080" }}>Cluster Monitor</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background:   active ? "rgba(59,130,246,0.15)" : "transparent",
                color:        active ? "#3b82f6" : "#94a3b8",
                borderLeft:   active ? "2px solid #3b82f6" : "2px solid transparent",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #1e2d52" }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: connected ? "#22c55e" : "#ef4444", boxShadow: connected ? "0 0 6px #22c55e" : "none" }}
          />
          <span className="text-xs" style={{ color: connected ? "#22c55e" : "#ef4444" }}>
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>
        {health && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: health === "Healthy" ? "#22c55e" : "#eab308" }} />
            <span className="text-xs" style={{ color: "#94a3b8" }}>{health}</span>
          </div>
        )}
        <div className="mt-3 text-xs" style={{ color: "#4a6080" }}>
          prod-eks-us-east-1
        </div>
      </div>
    </aside>
  );
}
