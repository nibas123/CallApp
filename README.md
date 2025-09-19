# WiFi Calling App

A simple WiFi calling app using WebRTC with large buttons optimized for elderly users. Works as a Progressive Web App (PWA) with auto-speakerphone functionality.

## Features

- **Large Button UI**: Optimized for elderly users with high contrast and large touch targets
- **WebRTC Audio Calling**: Direct peer-to-peer audio calls over WiFi
- **Progressive Web App**: Installable on mobile devices with offline capabilities
- **Auto-Speakerphone**: Automatically enables speakerphone for calls
- **Auto-Reconnect**: Automatically reconnects to server if disconnected
- **Auto Wake-up**: Automatically wakes up Render server when app opens
- **Call Timer**: Real-time call duration display
- **Simple Interface**: Just "Call [Name]" and "End Call" buttons

## Project Structure

```
CallApp/
├── src/                    # React frontend
│   ├── services/          # WebRTC and WebSocket services
│   ├── App.jsx           # Main app component
│   └── main.jsx          # React entry point
├── backend/               # Node.js WebSocket server
│   ├── server.js         # Signaling server
│   └── package.json      # Backend dependencies
├── public/               # PWA assets and icons
└── package.json          # Frontend dependencies
```

## Quick Start

### 1. Install Dependencies

Frontend:
```bash
npm install
```

Backend:
```bash
cd backend
npm install
```

### 2. Start Development Servers

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
npm run dev
```

### 3. Test the App

1. Open http://localhost:3000 in two different browser tabs/windows
2. In `src/App.jsx`, change `CURRENT_USER` to switch between `user1` and `user2`
3. Click the green "Call" button to start a call between users

## Configuration

### Users

Currently configured with two hardcoded users:
- **user1** (John) calls **user2** (Mary)
- **user2** (Mary) calls **user1** (John)

To change users, edit the `CURRENT_USER` variable in `src/App.jsx`:

```javascript
// Set current user (change this to switch between users)
const CURRENT_USER = USERS.user1 // or USERS.user2
```

### WebSocket Connection

The app connects to the WebSocket server URL defined in environment variables:

1. Copy `.env.example` to `.env.local`
2. Update `VITE_WS_URL` with your backend URL

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. Note your Render URL (e.g., `https://your-app-name.onrender.com`)

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`

2. Set environment variable for WebSocket URL:
```bash
vercel env add VITE_WS_URL
# Enter your Render WebSocket URL: wss://your-app-name.onrender.com
```

3. Deploy:
```bash
vercel --prod
```

### Environment Variables

**Frontend (.env.local):**
```
VITE_WS_URL=wss://your-backend-url.onrender.com
```

**Backend (Render):**
- `PORT` is automatically set by Render

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 14.3+)
- **Mobile**: Optimized for mobile browsers

## PWA Installation

1. Open the app in a mobile browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install App"

## Troubleshooting

### Common Issues

1. **"Not connected to server"**
   - Check if backend is running
   - Verify WebSocket URL in environment variables
   - Check firewall/network settings

2. **"Call failed"**
   - Ensure microphone permissions are granted
   - Check if both users are connected
   - Try refreshing both browser windows

3. **No audio during call**
   - Check microphone/speaker permissions
   - Ensure devices are not muted
   - Try using headphones to avoid echo

### Development Tips

1. **Testing with two users**: Open app in two browser windows and change `CURRENT_USER` in one of them
2. **Network issues**: Use browser developer tools → Network tab to check WebSocket connection
3. **Audio issues**: Check browser developer tools → Console for WebRTC errors

## Architecture

### Frontend (React + Vite)
- **App.jsx**: Main component handling UI state and call logic
- **WebRTCService**: Handles peer-to-peer WebRTC connections
- **WebSocketService**: Manages signaling server communication

### Backend (Node.js + WebSocket)
- **server.js**: WebSocket signaling server for exchanging WebRTC offers/answers/ICE candidates

### Communication Flow
1. User clicks "Call" → Frontend creates WebRTC offer
2. Offer sent to signaling server via WebSocket
3. Server forwards offer to target user
4. Target user creates answer, sent back through server
5. ICE candidates exchanged for peer connection
6. Direct WebRTC audio connection established

## License

MIT License - Feel free to use and modify for your needs.
