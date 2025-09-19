#!/bin/bash
# Local testing script

echo "🚀 Starting WiFi Calling App Local Test"
echo "======================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 3

echo ""
echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📱 Open these URLs to test:"
echo "   Frontend: http://localhost:5173"
echo "   Backend Health: http://localhost:3001/health"
echo ""
echo "🧪 Testing Instructions:"
echo "   1. Open frontend URL in two browser windows"
echo "   2. Grant microphone permissions in both"
echo "   3. In one window, edit src/App.jsx and change CURRENT_USER to USERS.user2"
echo "   4. Save the file (hot reload will update)"
echo "   5. Click 'Call' button to test WebRTC connection"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
