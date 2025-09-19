@echo off
echo 🚀 Starting WiFi Calling App Local Test
echo =======================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo 🔧 Starting backend server...
cd backend
start /B npm start
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting frontend development server...
start /B npm run dev

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Open these URLs to test:
echo    Frontend: http://localhost:5173
echo    Backend Health: http://localhost:3001/health
echo.
echo 🧪 Testing Instructions:
echo    1. Open frontend URL in two browser windows
echo    2. Grant microphone permissions in both
echo    3. In one window, edit src/App.jsx and change CURRENT_USER to USERS.user2
echo    4. Save the file (hot reload will update)
echo    5. Click 'Call' button to test WebRTC connection
echo.
echo Press any key to stop servers and exit...
pause >nul

echo 🛑 Stopping servers...
taskkill /F /IM node.exe 2>nul
echo Done!
