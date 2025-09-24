#!/bin/bash

# Development script to generate TypeScript client
# This script starts a Django dev server if needed and generates the client

set -e

echo "🚀 VerityInspect TypeScript Client Generator"
echo "========================================="

API_URL=${API_URL:-"http://localhost:8000"}
DJANGO_DIR="../apps/api"

# Function to check if Django server is running
check_server() {
    curl -s -f "$API_URL/health/" > /dev/null
}

# Function to start Django server
start_server() {
    echo "🔧 Starting Django development server..."
    cd "$DJANGO_DIR"
    python manage.py runserver --settings=verityinspect.settings &
    SERVER_PID=$!
    echo "Django server started with PID: $SERVER_PID"
    
    # Wait for server to start
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
        if check_server; then
            echo "✅ Server is ready!"
            return 0
        fi
        sleep 1
    done
    
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

# Function to cleanup
cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        echo "🧹 Shutting down Django server..."
        kill $SERVER_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Check if server is already running
echo "🔍 Checking if Django server is running..."
if ! check_server; then
    echo "Server not running, starting it..."
    start_server
    STARTED_SERVER=true
else
    echo "✅ Server is already running"
    STARTED_SERVER=false
fi

# Generate the client
echo "🏗️ Generating TypeScript client..."
node generate-client.js

echo ""
echo "✅ TypeScript client generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  - apps/web/src/generated/types.ts"
echo "  - apps/web/src/generated/client.ts" 
echo "  - apps/web/src/generated/index.ts"
echo ""
echo "🎯 Usage example:"
echo ""
echo "  import { VerityInspectClient } from '@/generated';"
echo ""
echo "  const client = new VerityInspectClient();"
echo "  client.setAuthToken('your-jwt-token');"
echo "  const videos = await client.get_videos();"
echo ""

# Only cleanup if we started the server
if [ "$STARTED_SERVER" = true ]; then
    cleanup
    trap - EXIT
fi