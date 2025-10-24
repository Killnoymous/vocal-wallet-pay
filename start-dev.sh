#!/bin/bash

# Start development servers for Vocal Wallet Pay

echo "🚀 Starting Vocal Wallet Pay Development Environment"
echo "=================================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null && ! docker ps | grep -q mongo; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   For Docker: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo"
    echo "   or"
    echo "   For local: brew services start mongodb-community"
    echo ""
    echo "Continuing anyway - the server will attempt to connect..."
fi

# Start the backend server
echo "📡 Starting backend server..."
cd server
MONGODB_URI=mongodb://admin:admin123@localhost:27017/vocal-wallet npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the frontend
echo "🌐 Starting frontend..."
cd ../
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping servers..."
kill $SERVER_PID $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped"