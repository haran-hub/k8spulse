"""
Realistic Kubernetes mock data generator.
Simulates a production-grade multi-node EKS cluster.
"""
import random
import math
from datetime import datetime, timedelta, timezone
from typing import Any

# ─── helpers ────────────────────────────────────────────────────────────────

def _ago(minutes: float) -> str:
    t = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    return t.isoformat()

def _rand_cpu(base: float, jitter: float = 5.0) -> float:
    return round(max(0.5, base + random.uniform(-jitter, jitter)), 1)

def _rand_mem(base: float, jitter: float = 3.0) -> float:
    return round(max(1.0, base + random.uniform(-jitter, jitter)), 1)

# ─── cluster info ───────────────────────────────────────────────────────────

CLUSTER_INFO = {
    "name": "prod-eks-us-east-1",
    "version": "1.29",
    "provider": "AWS EKS",
    "region": "us-east-1",
    "created_at": _ago(60 * 24 * 90),  # 90 days ago
}

# ─── namespaces ─────────────────────────────────────────────────────────────

NAMESPACES = [
    {"name": "default",        "status": "Active", "age_days": 90},
    {"name": "kube-system",    "status": "Active", "age_days": 90},
    {"name": "production",     "status": "Active", "age_days": 85},
    {"name": "staging",        "status": "Active", "age_days": 60},
    {"name": "monitoring",     "status": "Active", "age_days": 80},
    {"name": "ingress-nginx",  "status": "Active", "age_days": 85},
]

# ─── nodes ───────────────────────────────────────────────────────────────────

NODE_POOL_CONFIG = [
    {"name": "ip-10-0-1-101.ec2.internal", "instance": "m5.xlarge",  "vcpus": 4,  "memory_gb": 16, "role": "worker", "zone": "us-east-1a"},
    {"name": "ip-10-0-1-102.ec2.internal", "instance": "m5.xlarge",  "vcpus": 4,  "memory_gb": 16, "role": "worker", "zone": "us-east-1a"},
    {"name": "ip-10-0-2-201.ec2.internal", "instance": "m5.xlarge",  "vcpus": 4,  "memory_gb": 16, "role": "worker", "zone": "us-east-1b"},
    {"name": "ip-10-0-2-202.ec2.internal", "instance": "m5.2xlarge", "vcpus": 8,  "memory_gb": 32, "role": "worker", "zone": "us-east-1b"},
    {"name": "ip-10-0-3-301.ec2.internal", "instance": "m5.2xlarge", "vcpus": 8,  "memory_gb": 32, "role": "worker", "zone": "us-east-1c"},
    {"name": "ip-10-0-0-10.ec2.internal",  "instance": "m5.large",   "vcpus": 2,  "memory_gb": 8,  "role": "control-plane", "zone": "us-east-1a"},
]

def get_nodes(tick: int = 0) -> list[dict]:
    nodes = []
    for i, cfg in enumerate(NODE_POOL_CONFIG):
        cpu_base = 55 + (i * 5) % 30
        mem_base = 60 + (i * 7) % 25
        # Slight oscillation per tick
        osc = math.sin(tick * 0.3 + i) * 3
        cpu = _rand_cpu(cpu_base + osc)
        mem = _rand_mem(mem_base + osc * 0.5)
        node_status = "Ready" if i != 3 or tick % 40 > 5 else "NotReady"
        nodes.append({
            "name": cfg["name"],
            "status": node_status,
            "role": cfg["role"],
            "instance_type": cfg["instance"],
            "zone": cfg["zone"],
            "vcpus": cfg["vcpus"],
            "memory_gb": cfg["memory_gb"],
            "cpu_pct": cpu,
            "memory_pct": mem,
            "pods_running": random.randint(8, 20),
            "pods_capacity": 110,
            "kernel_version": "5.10.225-213.877.amzn2.x86_64",
            "os": "Amazon Linux 2",
            "container_runtime": "containerd://1.7.11",
            "kubelet_version": "v1.29.3",
            "age_days": 90,
            "conditions": [
                {"type": "MemoryPressure",   "status": "False"},
                {"type": "DiskPressure",     "status": "False"},
                {"type": "PIDPressure",      "status": "False"},
                {"type": "Ready",            "status": "True" if node_status == "Ready" else "False"},
            ],
        })
    return nodes

# ─── pods ────────────────────────────────────────────────────────────────────

POD_SPECS = [
    # production namespace
    {"name": "api-gateway",      "ns": "production",  "app": "api-gateway",      "image": "api-gateway:2.4.1",       "restarts": 0,  "node_idx": 0, "cpu_m": 180, "mem_mi": 256},
    {"name": "auth-service",     "ns": "production",  "app": "auth-service",     "image": "auth-service:1.9.0",      "restarts": 1,  "node_idx": 1, "cpu_m": 120, "mem_mi": 192},
    {"name": "user-service",     "ns": "production",  "app": "user-service",     "image": "user-service:3.1.2",      "restarts": 0,  "node_idx": 2, "cpu_m": 95,  "mem_mi": 128},
    {"name": "payment-svc",      "ns": "production",  "app": "payment-svc",      "image": "payment-svc:1.5.3",       "restarts": 0,  "node_idx": 3, "cpu_m": 200, "mem_mi": 512},
    {"name": "notification-svc", "ns": "production",  "app": "notification-svc", "image": "notif-svc:2.0.1",         "restarts": 3,  "node_idx": 4, "cpu_m": 60,  "mem_mi": 96},
    {"name": "worker-0",         "ns": "production",  "app": "job-worker",       "image": "job-worker:1.2.0",        "restarts": 0,  "node_idx": 0, "cpu_m": 310, "mem_mi": 384},
    {"name": "worker-1",         "ns": "production",  "app": "job-worker",       "image": "job-worker:1.2.0",        "restarts": 0,  "node_idx": 1, "cpu_m": 290, "mem_mi": 360},
    {"name": "postgres-0",       "ns": "production",  "app": "postgres",         "image": "postgres:16.2",           "restarts": 0,  "node_idx": 4, "cpu_m": 250, "mem_mi": 2048},
    {"name": "redis-master-0",   "ns": "production",  "app": "redis",            "image": "redis:7.2",               "restarts": 0,  "node_idx": 2, "cpu_m": 45,  "mem_mi": 256},
    # staging namespace
    {"name": "api-gateway",      "ns": "staging",     "app": "api-gateway",      "image": "api-gateway:2.5.0-rc1",   "restarts": 2,  "node_idx": 3, "cpu_m": 90,  "mem_mi": 192},
    {"name": "auth-service",     "ns": "staging",     "app": "auth-service",     "image": "auth-service:2.0.0-rc1",  "restarts": 0,  "node_idx": 0, "cpu_m": 70,  "mem_mi": 128},
    {"name": "user-service",     "ns": "staging",     "app": "user-service",     "image": "user-service:3.2.0-beta", "restarts": 5,  "node_idx": 1, "cpu_m": 50,  "mem_mi": 96},
    # monitoring namespace
    {"name": "prometheus-0",     "ns": "monitoring",  "app": "prometheus",       "image": "prom/prometheus:v2.51.0", "restarts": 0,  "node_idx": 5, "cpu_m": 400, "mem_mi": 1024},
    {"name": "grafana-0",        "ns": "monitoring",  "app": "grafana",          "image": "grafana/grafana:10.4.0",  "restarts": 0,  "node_idx": 5, "cpu_m": 80,  "mem_mi": 256},
    {"name": "alertmanager-0",   "ns": "monitoring",  "app": "alertmanager",     "image": "prom/alertmanager:v0.27.0","restarts": 0, "node_idx": 5, "cpu_m": 30,  "mem_mi": 64},
    # kube-system
    {"name": "coredns-abc12",    "ns": "kube-system", "app": "coredns",          "image": "coredns:1.11.1",          "restarts": 0,  "node_idx": 5, "cpu_m": 15,  "mem_mi": 32},
    {"name": "coredns-def34",    "ns": "kube-system", "app": "coredns",          "image": "coredns:1.11.1",          "restarts": 0,  "node_idx": 5, "cpu_m": 12,  "mem_mi": 28},
    {"name": "aws-node-a1b2",    "ns": "kube-system", "app": "aws-node",         "image": "amazon/aws-node:v1.18.0", "restarts": 0,  "node_idx": 0, "cpu_m": 20,  "mem_mi": 48},
]

def _pod_status(spec: dict, tick: int) -> dict:
    name = spec["name"]
    ns   = spec["ns"]
    # Simulate a failing pod occasionally
    if name == "user-service" and ns == "staging" and tick % 30 < 8:
        return {"phase": "CrashLoopBackOff", "ready": False, "container_ready": False}
    if name == "notification-svc" and ns == "production" and tick % 50 < 4:
        return {"phase": "Pending", "ready": False, "container_ready": False}
    return {"phase": "Running", "ready": True, "container_ready": True}

def get_pods(tick: int = 0) -> list[dict]:
    nodes = [n["name"] for n in NODE_POOL_CONFIG]
    pods = []
    for spec in POD_SPECS:
        st = _pod_status(spec, tick)
        osc = math.sin(tick * 0.25 + spec["cpu_m"]) * 10
        cpu = max(1, spec["cpu_m"] + int(osc) + random.randint(-5, 5))
        mem = max(16, spec["mem_mi"] + random.randint(-10, 10))
        pods.append({
            "name": f"{spec['name']}-{''.join(random.choices('abcdef0123456789', k=5))}",
            "display_name": spec["name"],
            "namespace": spec["ns"],
            "app": spec["app"],
            "image": spec["image"],
            "node": nodes[spec["node_idx"]],
            "status": st["phase"],
            "ready": st["ready"],
            "container_ready": st["container_ready"],
            "restarts": spec["restarts"] + (1 if st["phase"] == "CrashLoopBackOff" else 0),
            "cpu_millicores": cpu,
            "memory_mib": mem,
            "started_at": _ago(60 * 24 * random.randint(1, 30)),
            "liveness_probe": "HTTP /health :8080" if spec["ns"] != "kube-system" else "N/A",
            "readiness_probe": "HTTP /ready :8080" if spec["ns"] != "kube-system" else "N/A",
            "liveness_ok": st["ready"],
            "readiness_ok": st["ready"],
        })
    return pods

# ─── deployments ─────────────────────────────────────────────────────────────

DEPLOYMENT_SPECS = [
    {"name": "api-gateway",      "ns": "production", "desired": 3, "image": "api-gateway",      "strategy": "RollingUpdate"},
    {"name": "auth-service",     "ns": "production", "desired": 2, "image": "auth-service",     "strategy": "RollingUpdate"},
    {"name": "user-service",     "ns": "production", "desired": 2, "image": "user-service",     "strategy": "RollingUpdate"},
    {"name": "payment-svc",      "ns": "production", "desired": 2, "image": "payment-svc",      "strategy": "Recreate"},
    {"name": "notification-svc", "ns": "production", "desired": 1, "image": "notification-svc", "strategy": "RollingUpdate"},
    {"name": "job-worker",       "ns": "production", "desired": 2, "image": "job-worker",       "strategy": "RollingUpdate"},
    {"name": "api-gateway",      "ns": "staging",    "desired": 1, "image": "api-gateway",      "strategy": "RollingUpdate"},
    {"name": "auth-service",     "ns": "staging",    "desired": 1, "image": "auth-service",     "strategy": "RollingUpdate"},
    {"name": "user-service",     "ns": "staging",    "desired": 1, "image": "user-service",     "strategy": "RollingUpdate"},
    {"name": "grafana",          "ns": "monitoring", "desired": 1, "image": "grafana",           "strategy": "RollingUpdate"},
]

DEPLOY_HISTORY: dict[str, list] = {}

def _build_deploy_history(key: str) -> list[dict]:
    if key in DEPLOY_HISTORY:
        return DEPLOY_HISTORY[key]
    history = []
    versions = ["1.0.0", "1.1.0", "1.2.3", "2.0.0", "2.1.0", "2.3.1"]
    now = datetime.now(timezone.utc)
    for i, ver in enumerate(versions[-4:]):
        deployed_at = now - timedelta(days=(len(versions) - i) * 7)
        history.append({
            "revision":    i + 1,
            "version":     ver,
            "status":      "superseded" if i < len(versions) - 5 else "deployed",
            "deployed_at": deployed_at.isoformat(),
            "deployed_by": random.choice(["github-actions", "haran", "jenkins"]),
            "change_cause": f"Release {ver}",
        })
    DEPLOY_HISTORY[key] = history
    return history

def get_deployments(tick: int = 0) -> list[dict]:
    deps = []
    for spec in DEPLOYMENT_SPECS:
        key = f"{spec['ns']}/{spec['name']}"
        desired = spec["desired"]
        # Occasionally simulate a rolling update in progress
        rolling = (spec["name"] == "api-gateway" and spec["ns"] == "production" and tick % 60 < 10)
        ready    = desired - (1 if rolling else 0)
        updated  = desired - (1 if rolling else 0)
        history  = _build_deploy_history(key)
        deps.append({
            "name":             spec["name"],
            "namespace":        spec["ns"],
            "desired_replicas": desired,
            "ready_replicas":   ready,
            "updated_replicas": updated,
            "available_replicas": ready,
            "strategy":         spec["strategy"],
            "image":            spec["image"],
            "rolling_update":   rolling,
            "conditions": [
                {"type": "Available",   "status": "True"},
                {"type": "Progressing", "status": "True" if rolling else "False"},
            ],
            "history": history,
            "age_days": random.randint(30, 90),
        })
    return deps

# ─── HPAs ────────────────────────────────────────────────────────────────────

HPA_SPECS = [
    {"name": "api-gateway-hpa",      "ns": "production", "deployment": "api-gateway",      "min": 3,  "max": 10, "metric": "cpu", "target_pct": 70},
    {"name": "auth-service-hpa",     "ns": "production", "deployment": "auth-service",     "min": 2,  "max": 6,  "metric": "cpu", "target_pct": 65},
    {"name": "job-worker-hpa",       "ns": "production", "deployment": "job-worker",       "min": 2,  "max": 8,  "metric": "cpu", "target_pct": 80},
    {"name": "user-service-hpa",     "ns": "production", "deployment": "user-service",     "min": 2,  "max": 5,  "metric": "cpu", "target_pct": 60},
    {"name": "notification-hpa",     "ns": "production", "deployment": "notification-svc", "min": 1,  "max": 4,  "metric": "cpu", "target_pct": 75},
]

def get_hpas(tick: int = 0) -> list[dict]:
    hpas = []
    for spec in HPA_SPECS:
        osc = math.sin(tick * 0.2 + spec["min"]) * 15
        current_pct = round(spec["target_pct"] + osc + random.uniform(-5, 5), 1)
        # Determine if scaling is happening
        if current_pct > spec["target_pct"] * 1.15:
            scaling = "ScaleUp"
        elif current_pct < spec["target_pct"] * 0.7:
            scaling = "ScaleDown"
        else:
            scaling = "Stable"
        desired = spec["min"]
        if scaling == "ScaleUp":
            desired = min(spec["max"], spec["min"] + 1)
        hpas.append({
            "name":           spec["name"],
            "namespace":      spec["ns"],
            "deployment":     spec["deployment"],
            "min_replicas":   spec["min"],
            "max_replicas":   spec["max"],
            "current_replicas": desired,
            "desired_replicas": desired,
            "metric_type":    spec["metric"],
            "target_pct":     spec["target_pct"],
            "current_pct":    max(0, current_pct),
            "scaling_status": scaling,
            "last_scale_time": _ago(random.randint(5, 120)),
        })
    return hpas

# ─── events ──────────────────────────────────────────────────────────────────

EVENT_TEMPLATES = [
    {"type": "Normal",   "reason": "Pulled",        "obj": "pod/api-gateway",       "msg": "Successfully pulled image \"api-gateway:2.4.1\" in 3.2s"},
    {"type": "Normal",   "reason": "Started",       "obj": "pod/api-gateway",       "msg": "Started container api-gateway"},
    {"type": "Normal",   "reason": "ScalingReplicaSet", "obj": "deploy/api-gateway","msg": "Scaled up replica set api-gateway-xxx to 3"},
    {"type": "Warning",  "reason": "BackOff",       "obj": "pod/user-service",      "msg": "Back-off restarting failed container user-service in pod user-service-staging"},
    {"type": "Normal",   "reason": "SuccessfulCreate","obj": "replicaset/job-worker","msg": "Created pod: job-worker-0"},
    {"type": "Warning",  "reason": "FailedMount",   "obj": "pod/postgres-0",        "msg": "Unable to attach or mount volumes: unmounted volumes=[data]"},
    {"type": "Normal",   "reason": "Killing",       "obj": "pod/notification-svc",  "msg": "Stopping container notification-svc"},
    {"type": "Normal",   "reason": "Pulling",       "obj": "pod/auth-service",      "msg": "Pulling image \"auth-service:2.0.0-rc1\""},
    {"type": "Normal",   "reason": "NodeReady",     "obj": "node/ip-10-0-2-201",    "msg": "Node ip-10-0-2-201.ec2.internal status is now: NodeReady"},
    {"type": "Warning",  "reason": "OOMKilled",     "obj": "pod/worker-0",          "msg": "Container worker OOMKilled: limit 512Mi exceeded"},
    {"type": "Normal",   "reason": "ScalingReplicaSet","obj": "hpa/api-gateway-hpa","msg": "New size: 4; reason: cpu resource utilization (percentage of request) above target"},
    {"type": "Normal",   "reason": "EnsuringLoadBalancer","obj": "svc/api-gateway", "msg": "Ensuring load balancer for service production/api-gateway"},
]

_event_log: list[dict] = []

def get_events(tick: int = 0) -> list[dict]:
    global _event_log
    # Add new event every ~5 ticks
    if tick % 5 == 0:
        tmpl = random.choice(EVENT_TEMPLATES)
        _event_log.insert(0, {
            "type":      tmpl["type"],
            "reason":    tmpl["reason"],
            "object":    tmpl["obj"],
            "message":   tmpl["msg"],
            "namespace": random.choice(["production", "staging", "monitoring", "kube-system"]),
            "count":     random.randint(1, 5),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    # keep last 50
    _event_log = _event_log[:50]
    return _event_log

# ─── services ────────────────────────────────────────────────────────────────

SERVICES = [
    {"name": "api-gateway",     "ns": "production",  "type": "LoadBalancer", "cluster_ip": "10.100.0.10", "port": "80:443", "external": "a1b2c3d4.elb.amazonaws.com"},
    {"name": "auth-service",    "ns": "production",  "type": "ClusterIP",    "cluster_ip": "10.100.0.11", "port": "8080",   "external": None},
    {"name": "user-service",    "ns": "production",  "type": "ClusterIP",    "cluster_ip": "10.100.0.12", "port": "8080",   "external": None},
    {"name": "payment-svc",     "ns": "production",  "type": "ClusterIP",    "cluster_ip": "10.100.0.13", "port": "8443",   "external": None},
    {"name": "postgres",        "ns": "production",  "type": "ClusterIP",    "cluster_ip": "10.100.0.20", "port": "5432",   "external": None},
    {"name": "redis",           "ns": "production",  "type": "ClusterIP",    "cluster_ip": "10.100.0.21", "port": "6379",   "external": None},
    {"name": "grafana",         "ns": "monitoring",  "type": "LoadBalancer", "cluster_ip": "10.100.1.10", "port": "3000",   "external": "b2c3d4e5.elb.amazonaws.com"},
    {"name": "prometheus",      "ns": "monitoring",  "type": "ClusterIP",    "cluster_ip": "10.100.1.11", "port": "9090",   "external": None},
    {"name": "kubernetes",      "ns": "default",     "type": "ClusterIP",    "cluster_ip": "10.100.0.1",  "port": "443",    "external": None},
]

def get_services() -> list[dict]:
    return SERVICES

# ─── cluster summary ─────────────────────────────────────────────────────────

def get_cluster_summary(tick: int = 0) -> dict[str, Any]:
    nodes    = get_nodes(tick)
    pods     = get_pods(tick)
    deploys  = get_deployments(tick)
    hpas     = get_hpas(tick)

    total_pods     = len(pods)
    running_pods   = sum(1 for p in pods if p["status"] == "Running")
    pending_pods   = sum(1 for p in pods if p["status"] == "Pending")
    failed_pods    = sum(1 for p in pods if p["status"] == "CrashLoopBackOff")

    ready_nodes    = sum(1 for n in nodes if n["status"] == "Ready")
    avg_cpu        = round(sum(n["cpu_pct"] for n in nodes) / len(nodes), 1)
    avg_mem        = round(sum(n["memory_pct"] for n in nodes) / len(nodes), 1)

    scaling_hpas   = sum(1 for h in hpas if h["scaling_status"] != "Stable")
    rolling_deploys= sum(1 for d in deploys if d["rolling_update"])

    return {
        "cluster":       CLUSTER_INFO,
        "nodes_total":   len(nodes),
        "nodes_ready":   ready_nodes,
        "pods_total":    total_pods,
        "pods_running":  running_pods,
        "pods_pending":  pending_pods,
        "pods_failed":   failed_pods,
        "deployments":   len(deploys),
        "namespaces":    len(NAMESPACES),
        "services":      len(SERVICES),
        "hpas":          len(hpas),
        "scaling_hpas":  scaling_hpas,
        "rolling_deploys": rolling_deploys,
        "avg_cpu_pct":   avg_cpu,
        "avg_mem_pct":   avg_mem,
        "health":        "Healthy" if failed_pods == 0 and ready_nodes == len(nodes) else "Degraded",
        "tick":          tick,
    }
