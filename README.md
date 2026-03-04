# K8s Pulse — Kubernetes Cluster Dashboard

Real-time Kubernetes workload monitoring dashboard. Tracks pods, deployments, HPA status, resource usage, health probes, and rolling deploy history. Runs on realistic simulated EKS cluster data — no real cluster required.

## Features

- **Live Dashboard** — cluster health summary with CPU/memory charts (WebSocket, 3s refresh)
- **Nodes** — per-node resource gauges, conditions, instance type, AZ
- **Pods** — filterable table with status, restarts, liveness/readiness probe status
- **Deployments** — replica health bars, rolling update detection, full deploy history
- **HPA** — autoscaler status, replica range slider, CPU metric vs target
- **Events** — streaming event log, Warning/Normal filter

## Stack

- **Backend:** FastAPI + WebSocket (Python 3.12)
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Recharts
- **Hosting:** Render (backend) + Vercel (frontend)

## Run Locally

```bash
# Terminal 1 — Backend (http://localhost:8001)
./start-backend.sh

# Terminal 2 — Frontend (http://localhost:3001)
./start-frontend.sh
```

## Live

- Frontend: https://k8spulse.vercel.app
- API: https://k8spulse-api.onrender.com

---

Built by haran
