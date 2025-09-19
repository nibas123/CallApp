# Fixed Deployment Guide

## Step-by-Step Deployment Instructions

### Part 1: Deploy Backend to Render

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "WiFi calling app with Render wake-up"
   git branch -M main
   git remote add origin https://github.com/yourusername/wifi-calling-app.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `wifi-calling-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"
   - **Save your Render URL** (e.g., `https://wifi-calling-backend-abc123.onrender.com`)

### Part 2: Deploy Frontend to Vercel

#### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy with environment variables**:
   ```bash
   vercel --prod
   ```
   
   During setup:
   - Project name: `wifi-calling-app`
   - Directory: `./`
   
4. **Add environment variable**:
   ```bash
   vercel env add VITE_WS_URL production
   ```
   When prompted, enter your Render WebSocket URL:
   ```
   wss://wifi-calling-backend-abc123.onrender.com
   ```

5. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

#### Method 2: Using Vercel Dashboard

1. **Deploy via GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

2. **Add environment variable**:
   - Go to Project Settings → Environment Variables
   - Add new variable:
     - **Name**: `VITE_WS_URL`
     - **Value**: `wss://your-render-backend-url.onrender.com`
     - **Environment**: Production

3. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"

### Part 3: Test Your Deployment

1. **Open your Vercel app URL** in two browser windows
2. **Check connection status** - you should see "Ready to call" instead of "Connecting..."
3. **Test calling** between the two windows

### Troubleshooting Environment Variables

If you see connection issues:

1. **Check environment variables**:
   ```bash
   vercel env ls
   ```

2. **Update environment variable**:
   ```bash
   vercel env rm VITE_WS_URL production
   vercel env add VITE_WS_URL production
   # Enter: wss://your-render-url.onrender.com
   ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Troubleshooting Build Issues

If you see "PostCSS config" or "module is not defined" errors:

1. **The project uses PostCSS config with `.cjs` extension** for ES module compatibility
2. **If build fails**, ensure you have these files:
   - ✅ `postcss.config.cjs` (correct)
   - ❌ `postcss.config.js` (remove this if it exists)

3. **Force clean deployment**:
   ```bash
   git add .
   git commit -m "Fix PostCSS config for deployment"
   git push
   vercel --prod --force
   ```

If you see "Could not resolve" import errors:

1. **Check import paths match actual filenames** (case-sensitive)
2. **Verify all service files exist**:
   - ✅ `src/services/webrtc.js`
   - ✅ `src/services/websocket.js` 
   - ✅ `src/services/renderWakeup.js`

3. **Clean and rebuild**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Verify Everything Works

1. **Backend health check**: Visit `https://your-render-url.onrender.com/health`
2. **Frontend connection**: Look for green dot in app footer
3. **WebSocket connection**: Check browser console for connection messages

Your app should now automatically wake up the Render service when opened and show real-time connection status!
