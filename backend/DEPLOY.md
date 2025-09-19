# Backend Deployment Instructions

## Deploy to Render

1. **Create a Render account** at https://render.com

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this code

3. **Configure the service**:
   - **Name**: `wifi-calling-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (sufficient for testing)

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://wifi-calling-backend.onrender.com`)

5. **Update Frontend**:
   - In your frontend `.env.local`, update:
   ```
   VITE_WS_URL=wss://your-service-name.onrender.com
   ```
   - For Vercel deployment, set this as an environment variable

## Environment Variables

No additional environment variables needed - Render automatically sets `PORT`.

## SSL/WSS

Render automatically provides SSL certificates, so your WebSocket URL will use `wss://` (secure WebSocket).

## Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- May take 10-30 seconds to wake up on first request
- 750 hours/month free usage

## Testing

After deployment, test the WebSocket connection:
```bash
# Replace with your actual Render URL
wscat -c wss://your-service-name.onrender.com
```

Then send a test message:
```json
{"type": "register", "userId": "test-user"}
```
