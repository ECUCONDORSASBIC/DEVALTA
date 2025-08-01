#!/bin/bash

echo "Starting HTTPS server for Companies App..."
echo ""
echo "This script will:"
echo "1. Start Next.js in development mode"
echo "2. Provide HTTPS access"
echo ""

# Start Next.js in development mode
echo "Starting Next.js development server..."
npm run dev:http &
NEXT_PID=$!

# Wait for Next.js to start
echo "Waiting for Next.js to start..."
sleep 5

# Check if Next.js is running
if ! curl -s http://localhost:3004 > /dev/null; then
    echo "Error: Next.js failed to start"
    kill $NEXT_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Next.js is running at http://localhost:3004"
echo ""
echo "To access with HTTPS:"
echo "1. Use ngrok: ngrok http 3004"
echo "2. Or use the custom server: npm run dev"
echo ""
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait $NEXT_PID