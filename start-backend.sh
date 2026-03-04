#!/usr/bin/env bash
cd "$(dirname "$0")/backend"
if [ ! -d ".venv" ]; then
  /opt/homebrew/bin/python3.12 -m venv .venv
  .venv/bin/pip install -r requirements.txt -q
fi
echo "Starting K8s Pulse backend on http://localhost:8001"
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
