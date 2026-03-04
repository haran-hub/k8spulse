import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.mock_data import (
    get_cluster_summary,
    get_nodes,
    get_pods,
    get_deployments,
    get_hpas,
    get_events,
    get_services,
    NAMESPACES,
)
from app.websocket_manager import manager

# Global simulation tick
_tick = 0
_broadcast_task: asyncio.Task | None = None


async def _simulator():
    """Push cluster state to all WebSocket clients every 3 seconds."""
    global _tick
    while True:
        await asyncio.sleep(3)
        _tick += 1
        if manager.count > 0:
            payload = {
                "type":    "cluster_update",
                "summary": get_cluster_summary(_tick),
                "nodes":   get_nodes(_tick),
                "pods":    get_pods(_tick),
                "hpas":    get_hpas(_tick),
                "events":  get_events(_tick)[:10],
            }
            await manager.broadcast(payload)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _broadcast_task
    _broadcast_task = asyncio.create_task(_simulator())
    yield
    if _broadcast_task:
        _broadcast_task.cancel()


app = FastAPI(title="K8s Pulse API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REST endpoints ──────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/summary")
def summary():
    return get_cluster_summary(_tick)


@app.get("/api/nodes")
def nodes():
    return get_nodes(_tick)


@app.get("/api/pods")
def pods(namespace: str = ""):
    data = get_pods(_tick)
    if namespace:
        data = [p for p in data if p["namespace"] == namespace]
    return data


@app.get("/api/deployments")
def deployments(namespace: str = ""):
    data = get_deployments(_tick)
    if namespace:
        data = [d for d in data if d["namespace"] == namespace]
    return data


@app.get("/api/hpa")
def hpa():
    return get_hpas(_tick)


@app.get("/api/events")
def events(namespace: str = ""):
    data = get_events(_tick)
    if namespace:
        data = [e for e in data if e["namespace"] == namespace]
    return data


@app.get("/api/services")
def services(namespace: str = ""):
    data = get_services()
    if namespace:
        data = [s for s in data if s["ns"] == namespace]
    return data


@app.get("/api/namespaces")
def namespaces():
    return NAMESPACES


# ─── WebSocket ───────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    # Send full state immediately on connect
    await ws.send_text(json.dumps({
        "type":        "cluster_update",
        "summary":     get_cluster_summary(_tick),
        "nodes":       get_nodes(_tick),
        "pods":        get_pods(_tick),
        "hpas":        get_hpas(_tick),
        "events":      get_events(_tick)[:10],
        "deployments": get_deployments(_tick),
        "services":    get_services(),
        "namespaces":  NAMESPACES,
    }))
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
