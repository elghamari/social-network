#!/bin/bash
set -e

trap 'echo "Stopping services..."; kill $GO_PID $NEXT_PID 2>/dev/null; exit 0' SIGTERM SIGINT

echo "Starting Go backend..."
./server &
GO_PID=$!

echo "Starting Next.js frontend..."
cd web
node server.js &
NEXT_PID=$!
cd ..

wait -n $GO_PID $NEXT_PID
kill $GO_PID $NEXT_PID 2>/dev/null
exit 1
