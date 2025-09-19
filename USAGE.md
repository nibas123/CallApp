# WiFi Calling App - Usage Information & Limits

## 🚀 Auto Wake-up Feature

Your app now automatically wakes up the Render backend when you open it! Here's how it works:

### What happens when you open the app:
1. **Detects Production**: App checks if using Render URL
2. **Wakes Server**: Sends HTTP request to `/health` endpoint
3. **Connects**: WebSocket connection starts after server is awake
4. **Status Display**: Shows "Waking up server..." during process

### Expected timing:
- **First load**: 15-30 seconds (if server was sleeping)
- **Subsequent loads**: 2-5 seconds (if server already awake)

## ⏰ Call Duration & Limits

### Free Tier Limitations (Render):

#### **Monthly Usage**:
- **750 hours/month** total server runtime
- **≈ 25 hours/day** if used every day
- **≈ 1500 minutes** of calling time per day

#### **Daily Usage Calculation**:
```
Server Runtime = Active calling time + Idle connection time
- 1 hour of calls = ~1 hour server time
- 8 hours idle connected = ~8 hours server time
- Total daily: ~9 hours server time
```

#### **Realistic Usage**:
- **Heavy use**: 2-3 hours of actual calling per day
- **Normal use**: 30-60 minutes of calling per day
- **Light use**: 10-30 minutes of calling per day

### **Call Quality & Duration**:

#### **Audio Quality**:
- **Bitrate**: 16-64 kbps (voice optimized)
- **Latency**: 50-200ms (depending on connection)
- **Quality**: HD voice over WiFi

#### **Individual Call Limits**:
- **No time limit** per call (limited by browser/device)
- **Typical maximum**: 2-4 hours per call (browser limitation)
- **Recommended**: End and restart calls every 1-2 hours

#### **Data Usage** (for reference):
- **Voice calling**: ~1 MB per minute
- **1 hour call**: ~60 MB data
- **Daily usage**: 60-180 MB (1-3 hours calling)

## 📊 Usage Monitoring

### App Features:
- **Real-time timer**: Shows call duration during calls
- **Connection status**: Green/red indicator
- **Server status**: "Waking up" indicator
- **Auto-reconnect**: Handles disconnections

### Render Dashboard Monitoring:
1. **Go to**: [Render Dashboard](https://dashboard.render.com)
2. **Select**: Your service
3. **Check**: Metrics tab for usage statistics
4. **Monitor**: Hours used vs. 750 hour limit

## 🔧 Optimization Tips

### To Maximize Usage:

#### **Server Sleep Management**:
- **Sleeps after**: 15 minutes of no activity
- **Wake-up time**: 10-30 seconds
- **Tip**: Keep browser tab open to maintain connection

#### **Connection Best Practices**:
- **Close app**: When not needed (saves server hours)
- **WiFi quality**: Use stable WiFi for best experience
- **Browser**: Use Chrome/Edge for best compatibility

#### **Battery & Performance**:
- **Speakerphone**: Auto-enabled for hands-free use
- **Background**: App continues calls when minimized
- **PWA install**: Better performance when installed

## 📈 Upgrade Options

### If you exceed free limits:

#### **Render Pro Plan** ($7/month):
- **Always-on**: No sleeping (instant connections)
- **Better performance**: Faster response times
- **Unlimited hours**: No monthly usage limits

#### **Alternative Free Options**:
- **Railway**: 500 hours/month free
- **Fly.io**: 160 hours/month free
- **Heroku**: No longer has free tier

## 🎯 Typical Usage Scenarios

### **Elderly User** (Target audience):
- **Daily calls**: 2-3 calls, 15-30 minutes each
- **Monthly usage**: ~300-400 server hours
- **Status**: ✅ Well within free limits

### **Family Use**:
- **Multiple daily calls**: 1-2 hours total
- **Monthly usage**: ~500-600 server hours
- **Status**: ✅ Within free limits

### **Heavy Business Use**:
- **Extended calls**: 4-6 hours daily
- **Monthly usage**: ~900+ server hours
- **Status**: ⚠️ May exceed free limits

## 🔄 Auto-Management Features

### Smart Connection:
- **Auto-wake**: Server wakes when app opens
- **Auto-reconnect**: Reconnects if connection drops
- **Error handling**: User-friendly error messages
- **Status updates**: Clear connection status

### Call Management:
- **Auto-speakerphone**: Enabled by default
- **Call timer**: Shows duration in real-time
- **Clean disconnect**: Proper call termination
- **State management**: Handles all call states

## 📞 Support & Troubleshooting

### Common Issues:

#### **"Waking up server" takes too long**:
- **Wait**: Up to 30 seconds on first load
- **Refresh**: Try refreshing if stuck
- **Check**: Internet connection

#### **Call quality issues**:
- **WiFi**: Ensure stable connection
- **Bandwidth**: Need ~100 kbps for voice
- **Browser**: Update to latest version

#### **Server limits reached**:
- **Check**: Render dashboard for usage
- **Wait**: Usage resets monthly
- **Upgrade**: Consider paid plan

Your WiFi calling app is now optimized for the best user experience with automatic server management!
