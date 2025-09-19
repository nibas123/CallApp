<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# WiFi Calling App - Copilot Instructions

This is a WebRTC-based WiFi calling application optimized for elderly users with the following architecture:

## Frontend (React + Vite + Tailwind CSS)
- Large button UI with high contrast for elderly users
- Progressive Web App (PWA) with service worker and manifest
- WebRTC audio calling with auto-speakerphone
- Auto-reconnecting WebSocket client
- Hardcoded user system (user1 ↔ user2)

## Backend (Node.js + WebSocket)
- Simple signaling server for WebRTC offer/answer/ICE candidate exchange
- User registration and message forwarding
- Deployed on Render

## Key Design Principles
1. **Simplicity**: Only "Call [Name]" and "End Call" buttons
2. **Accessibility**: Large fonts, high contrast, minimal UI
3. **Reliability**: Auto-reconnect, error handling, connection status
4. **Mobile-first**: Optimized for small phone screens

## Code Patterns
- Use Tailwind classes for responsive design (`text-4xl md:text-5xl`)
- Event-driven architecture with custom EventTarget classes
- Environment variables for WebSocket URL configuration
- Error boundaries and user-friendly error messages

## When editing:
- Maintain large button sizes and high contrast
- Keep UI minimal and elderly-friendly
- Preserve WebRTC audio-only functionality
- Test cross-browser compatibility
- Ensure PWA features work correctly
