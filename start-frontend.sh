#!/usr/bin/env bash
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/frontend"
echo "Starting K8s Pulse frontend on http://localhost:3001"
npm run dev -- --port 3001
