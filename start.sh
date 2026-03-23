#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Starting GHL Marketplace App..."

# Start backend
cd "$ROOT/server"
npm run dev &
SERVER_PID=$!

# Start frontend
cd "$ROOT/client"
npm start &
CLIENT_PID=$!

echo ""
echo "Backend PID:  $SERVER_PID"
echo "Frontend PID: $CLIENT_PID"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."

# Wait for Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait
