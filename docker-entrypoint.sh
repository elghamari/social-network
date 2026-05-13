#!/bin/bash
# ================================================================
#  docker-entrypoint.sh
#  Starts both the Go API server and the Next.js frontend
#  inside a single container.
# ================================================================

set -e

echo "🚀 Starting Nexus Social Network..."

# ── 1. Start the Go backend in the background ──
# The Go server runs on port 8080 and handles:
#   - REST API  (/api/*)
#   - WebSocket (/api/ws/*)
#   - Static uploads served via Next.js rewrite
echo "  → Starting Go API server on :8080"
./server &
GO_PID=$!

# ── 2. Start the Next.js frontend in the foreground ──
# "next start" serves the production build on port 3000.
# API calls are proxied to the Go backend via next.config.ts rewrites.
echo "  → Starting Next.js frontend on :3000"
cd web && npx next start &
NEXT_PID=$!

echo "  ✓ Both services are running"
echo "    API:      http://localhost:8080"
echo "    Frontend: http://localhost:3000"

# ── 3. Wait for either process to exit ──
# If one crashes, we want the container to stop (and restart
# via Docker's --restart policy), not silently run half-broken.
wait -n $GO_PID $NEXT_PID

# If we get here, one process exited. Kill the other and exit.
echo "⚠ A process exited. Shutting down..."
kill $GO_PID $NEXT_PID 2>/dev/null
exit 1
