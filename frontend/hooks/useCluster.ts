"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { WS_URL } from "@/lib/api";
import type { WsMessage, ClusterSummary, K8sNode, Pod, HPA, K8sEvent, Deployment, Service } from "@/lib/types";

interface ClusterState {
  summary:     ClusterSummary | null;
  nodes:       K8sNode[];
  pods:        Pod[];
  hpas:        HPA[];
  events:      K8sEvent[];
  deployments: Deployment[];
  services:    Service[];
  namespaces:  { name: string; status: string; age_days: number }[];
  connected:   boolean;
  lastUpdate:  Date | null;
}

const INIT: ClusterState = {
  summary: null, nodes: [], pods: [], hpas: [],
  events: [], deployments: [], services: [], namespaces: [],
  connected: false, lastUpdate: null,
};

export function useCluster() {
  const [state, setState] = useState<ClusterState>(INIT);
  const wsRef   = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setState(s => ({ ...s, connected: true }));

    ws.onmessage = (e) => {
      const msg: WsMessage = JSON.parse(e.data);
      if (msg.type === "cluster_update") {
        setState(s => ({
          ...s,
          summary:     msg.summary     ?? s.summary,
          nodes:       msg.nodes       ?? s.nodes,
          pods:        msg.pods        ?? s.pods,
          hpas:        msg.hpas        ?? s.hpas,
          events:      msg.events      ? [...msg.events, ...s.events].slice(0, 50) : s.events,
          deployments: msg.deployments ?? s.deployments,
          services:    msg.services    ?? s.services,
          namespaces:  msg.namespaces  ?? s.namespaces,
          lastUpdate:  new Date(),
        }));
      }
    };

    ws.onclose = () => {
      setState(s => ({ ...s, connected: false }));
      timerRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}
