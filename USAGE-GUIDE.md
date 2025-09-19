# WiFi Calling App Usage Guide

## ⏱️ How Long Can You Call?

### Free Tier Limitations

#### Render Backend (Free Plan):
- **Monthly Usage**: 750 hours/month total
- **Per Call**: Technically unlimited duration per call
- **Sleep Behavior**: Service sleeps after 15 minutes of inactivity
- **Wake-up Time**: 10-30 seconds when service is sleeping
- **Concurrent Calls**: Supports multiple users simultaneously

#### Vercel Frontend (Hobby Plan):
- **No time limits** on frontend usage
- **Bandwidth**: 100GB/month (more than enough for signaling)
- **Functions**: Not applicable (we're using static hosting)

### Real-World Call Duration Limits:

1. **WebRTC Connection Stability**:
   - Typical stable duration: **2-4 hours** per call
   - Browser memory management may require refresh after long calls
   - Mobile browsers may limit background audio after 30-60 minutes

2. **Network Factors**:
   - WiFi connection stability affects call quality
   - Router timeout settings (usually 2-4 hours)
   - ISP connection drops

3. **Device Limitations**:
   - Mobile battery life during calls
   - Browser tab management on mobile devices
   - Device sleep/lock settings

### Practical Usage Recommendations:

- **Normal Calls**: Up to 2 hours comfortably
- **Long Calls**: Refresh browser every 2 hours for stability
- **Daily Usage**: No limits with free tier (750 hours = 25 hours/day)

## 🚀 How the Render Wake-Up Works

### Automatic Wake-Up Process:

1. **App Opens**: 
   - Immediately sends HTTP request to `https://your-backend.onrender.com/health`
   - Shows "Waking up server..." status message

2. **Service Response**:
   - **If awake**: Connects immediately (2-3 seconds)
   - **If sleeping**: Takes 10-30 seconds to wake up
   - **If failed**: Retries 3 times with increasing delays

3. **Status Indicators**:
   - 🔴 "Waking up server..." - Service is starting
   - 🟡 "Connecting..." - Attempting WebSocket connection
   - 🟢 "Ready to call [Name]" - Fully connected and ready

### Wake-Up Status Messages:

```javascript
// You'll see these in the app:
"Waking up server..."        // HTTP ping to /health endpoint
"Connecting..."              // WebSocket connection attempt
"Ready to call [Name]"       // Fully connected
"Connection failed"          // Need to refresh/retry
```

### Technical Implementation:

The app automatically:
1. Extracts backend URL from environment variable
2. Converts WebSocket URL (`wss://`) to HTTP URL (`https://`)
3. Sends GET request to `/health` endpoint
4. Waits for 200 OK response with server stats
5. Proceeds with WebSocket connection
6. Shows real-time connection status

## 📊 Usage Statistics

### What You Can Monitor:

1. **Connection Status**: Green/red dot in footer
2. **Server Health**: Automatic health checks
3. **Call Duration**: Timer during active calls
4. **Users Online**: Backend tracks connected users

### Backend Metrics Available:

```json
{
  "status": "healthy",
  "clients": 2,
  "uptime": 3600,
  "timestamp": "2025-09-19T04:30:00.000Z"
}
```

## 💰 Cost Breakdown (Free Tier)

### Monthly Limits:
- **Render**: 750 hours total runtime
- **Vercel**: Unlimited static hosting + 100GB bandwidth
- **Your Internet**: Normal data usage (voice calls use ~1MB/minute)

### Upgrade Scenarios:

**If you exceed 750 hours/month on Render:**
- Upgrade to Render Starter: $7/month for always-on service
- Benefits: No sleep delays, faster connections, 24/7 availability

**Typical Usage Patterns:**
- **Light Usage** (1-2 hours/day): ~60 hours/month - ✅ Free tier sufficient
- **Moderate Usage** (3-4 hours/day): ~120 hours/month - ✅ Free tier sufficient  
- **Heavy Usage** (8+ hours/day): 240+ hours/month - ✅ Still within free tier
- **Business Use** (multiple users, 24/7): Consider paid plan for reliability

## 🔧 Optimization Tips

1. **Reduce Wake-Up Time**:
   - Keep a browser tab open to prevent service sleep
   - Use paid Render plan for always-on service

2. **Improve Call Quality**:
   - Use strong WiFi connection
   - Close unnecessary browser tabs
   - Enable speakerphone mode (automatic in this app)

3. **Battery Optimization**:
   - Plug in device for long calls
   - Use airplane mode + WiFi for better battery life
   - Keep screen brightness low

## 📱 Mobile Usage

### Install as PWA:
1. Open app in mobile browser
2. Tap "Add to Home Screen" 
3. App works like native calling app
4. Offline capability for interface
5. Background audio support

### Mobile Limitations:
- iOS: Background audio limited to ~30 minutes
- Android: Better background support
- Solution: Keep app in foreground during calls

Your WiFi calling app is designed to work within free tier limits while providing reliable calling functionality!
