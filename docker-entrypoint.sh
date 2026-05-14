#!/bin/bash
set -e

# ── Trap signals for clean shutdown ──
trap 'echo "🛑 Stopping services..."; kill $GO_PID $NEXT_PID 2>/dev/null; exit 0' SIGTERM SIGINT

echo "🛠️ Building Go Backend..."
go build -o server ./cmd/main.go

echo "🛠️ Building Next.js Frontend..."
cd web
npm install
npm run build
cd ..

echo "🚀 Starting Nexus Social Network..."

./server &
GO_PID=$!

# ── 2. Start Next.js frontend ──
cd web
npm start &
NEXT_PID=$!

wait -n $GO_PID $NEXT_PID
kill $GO_PID $NEXT_PID 2>/dev/null
exit 1