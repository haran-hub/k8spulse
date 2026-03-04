const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  summary:     () => get<import("./types").ClusterSummary>("/api/summary"),
  nodes:       () => get<import("./types").K8sNode[]>("/api/nodes"),
  pods:        (ns?: string) => get<import("./types").Pod[]>(`/api/pods${ns ? `?namespace=${ns}` : ""}`),
  deployments: (ns?: string) => get<import("./types").Deployment[]>(`/api/deployments${ns ? `?namespace=${ns}` : ""}`),
  hpa:         () => get<import("./types").HPA[]>("/api/hpa"),
  events:      (ns?: string) => get<import("./types").K8sEvent[]>(`/api/events${ns ? `?namespace=${ns}` : ""}`),
  services:    (ns?: string) => get<import("./types").Service[]>(`/api/services${ns ? `?namespace=${ns}` : ""}`),
  namespaces:  () => get<{ name: string; status: string; age_days: number }[]>("/api/namespaces"),
};

export const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001")
  .replace(/^http/, "ws") + "/ws";
