#!/bin/bash

echo "🚀 Starting Go Backend..."
./server &

echo "🚀 Starting Next.js Frontend..."
cd web
HOSTNAME="0.0.0.0" PORT=3000 node server.js