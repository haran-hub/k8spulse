export interface ClusterInfo {
  name: string;
  version: string;
  provider: string;
  region: string;
  created_at: string;
}

export interface ClusterSummary {
  cluster: ClusterInfo;
  nodes_total: number;
  nodes_ready: number;
  pods_total: number;
  pods_running: number;
  pods_pending: number;
  pods_failed: number;
  deployments: number;
  namespaces: number;
  services: number;
  hpas: number;
  scaling_hpas: number;
  rolling_deploys: number;
  avg_cpu_pct: number;
  avg_mem_pct: number;
  health: "Healthy" | "Degraded";
  tick: number;
}

export interface NodeCondition {
  type: string;
  status: string;
}

export interface K8sNode {
  name: string;
  status: "Ready" | "NotReady";
  role: string;
  instance_type: string;
  zone: string;
  vcpus: number;
  memory_gb: number;
  cpu_pct: number;
  memory_pct: number;
  pods_running: number;
  pods_capacity: number;
  kernel_version: string;
  os: string;
  container_runtime: string;
  kubelet_version: string;
  age_days: number;
  conditions: NodeCondition[];
}

export interface Pod {
  name: string;
  display_name: string;
  namespace: string;
  app: string;
  image: string;
  node: string;
  status: "Running" | "Pending" | "CrashLoopBackOff" | "Failed";
  ready: boolean;
  container_ready: boolean;
  restarts: number;
  cpu_millicores: number;
  memory_mib: number;
  started_at: string;
  liveness_probe: string;
  readiness_probe: string;
  liveness_ok: boolean;
  readiness_ok: boolean;
}

export interface DeployCondition {
  type: string;
  status: string;
}

export interface DeployRevision {
  revision: number;
  version: string;
  status: string;
  deployed_at: string;
  deployed_by: string;
  change_cause: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  desired_replicas: number;
  ready_replicas: number;
  updated_replicas: number;
  available_replicas: number;
  strategy: string;
  image: string;
  rolling_update: boolean;
  conditions: DeployCondition[];
  history: DeployRevision[];
  age_days: number;
}

export interface HPA {
  name: string;
  namespace: string;
  deployment: string;
  min_replicas: number;
  max_replicas: number;
  current_replicas: number;
  desired_replicas: number;
  metric_type: string;
  target_pct: number;
  current_pct: number;
  scaling_status: "Stable" | "ScaleUp" | "ScaleDown";
  last_scale_time: string;
}

export interface K8sEvent {
  type: "Normal" | "Warning";
  reason: string;
  object: string;
  message: string;
  namespace: string;
  count: number;
  timestamp: string;
}

export interface Service {
  name: string;
  ns: string;
  type: string;
  cluster_ip: string;
  port: string;
  external: string | null;
}

export interface WsMessage {
  type: string;
  summary?: ClusterSummary;
  nodes?: K8sNode[];
  pods?: Pod[];
  hpas?: HPA[];
  events?: K8sEvent[];
  deployments?: Deployment[];
  services?: Service[];
  namespaces?: { name: string; status: string; age_days: number }[];
}
