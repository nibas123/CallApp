const WebSocket = require('ws')
const http = require('http')

class SignalingServer {
  constructor() {
    this.clients = new Map() // userId -> WebSocket
    this.port = process.env.PORT || 3001
  }

  start() {
    // Create HTTP server for health checks
    this.server = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          status: 'ok', 
          clients: this.clients.size,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }))
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('WebSocket Signaling Server - Use WebSocket connection')
      }
    })

    this.wss = new WebSocket.Server({ 
      server: this.server,
      perMessageDeflate: false
    })

    this.server.listen(this.port)

    console.log(`WebSocket signaling server started on port ${this.port}`)
    console.log(`Health check available at http://localhost:${this.port}/health`)

    this.wss.on('connection', (ws, req) => {
      console.log('New client connected from:', req.socket.remoteAddress)
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          console.error('Invalid message format:', error)
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        // Remove client from registered users
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId)
            console.log(`User ${userId} disconnected`)
            break
          }
        }
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        message: 'Connected to signaling server'
      })
    })
  }

  handleMessage(ws, message) {
    console.log('Received message:', message.type, 'from:', message.from || 'unknown')

    switch (message.type) {
      case 'register':
        this.handleRegister(ws, message)
        break

      case 'call-offer':
        this.handleCallOffer(ws, message)
        break

      case 'call-answer':
        this.handleCallAnswer(ws, message)
        break

      case 'ice-candidate':
        this.handleIceCandidate(ws, message)
        break

      case 'call-end':
        this.handleCallEnd(ws, message)
        break

      default:
        console.warn('Unknown message type:', message.type)
        this.sendError(ws, 'Unknown message type')
    }
  }

  handleRegister(ws, message) {
    const { userId } = message
    
    if (!userId) {
      this.sendError(ws, 'User ID is required')
      return
    }

    // Register or update user
    this.clients.set(userId, ws)
    console.log(`User ${userId} registered`)

    this.send(ws, {
      type: 'registered',
      userId: userId,
      message: 'Successfully registered'
    })
  }

  handleCallOffer(ws, message) {
    const { from, to, offer } = message
    
    if (!from || !to || !offer) {
      this.sendError(ws, 'Missing required fields for call offer')
      return
    }

    const targetClient = this.clients.get(to)
    if (!targetClient) {
      this.sendError(ws, `User ${to} not found or offline`)
      return
    }

    // Forward call offer to target user
    this.send(targetClient, {
      type: 'call-offer',
      from: from,
      to: to,
      offer: offer
    })

    console.log(`Call offer forwarded from ${from} to ${to}`)
  }

  handleCallAnswer(ws, message) {
    const { from, to, answer } = message
    
    if (!from || !to || !answer) {
      this.sendError(ws, 'Missing required fields for call answer')
      return
    }

    const targetClient = this.clients.get(to)
    if (!targetClient) {
      this.sendError(ws, `User ${to} not found or offline`)
      return
    }

    // Forward call answer to target user
    this.send(targetClient, {
      type: 'call-answer',
      from: from,
      to: to,
      answer: answer
    })

    console.log(`Call answer forwarded from ${from} to ${to}`)
  }

  handleIceCandidate(ws, message) {
    const { from, to, candidate } = message
    
    if (!from || !to || !candidate) {
      this.sendError(ws, 'Missing required fields for ICE candidate')
      return
    }

    const targetClient = this.clients.get(to)
    if (!targetClient) {
      // ICE candidates can arrive after disconnect, so just log and ignore
      console.log(`ICE candidate for ${to} ignored (user offline)`)
      return
    }

    // Forward ICE candidate to target user
    this.send(targetClient, {
      type: 'ice-candidate',
      from: from,
      to: to,
      candidate: candidate
    })

    console.log(`ICE candidate forwarded from ${from} to ${to}`)
  }

  handleCallEnd(ws, message) {
    const { from, to } = message
    
    if (!from || !to) {
      this.sendError(ws, 'Missing required fields for call end')
      return
    }

    const targetClient = this.clients.get(to)
    if (targetClient) {
      // Forward call end to target user
      this.send(targetClient, {
        type: 'call-end',
        from: from,
        to: to
      })
    }

    console.log(`Call ended between ${from} and ${to}`)
  }

  send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  sendError(ws, errorMessage) {
    this.send(ws, {
      type: 'error',
      message: errorMessage
    })
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      clients: Array.from(this.clients.keys())
    }
  }
}

// Start the server
const server = new SignalingServer()
server.start()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down signaling server...')
  if (server.wss) {
    server.wss.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  }
})

// Log server stats every 30 seconds
setInterval(() => {
  const stats = server.getStats()
  console.log(`Server stats: ${stats.connectedClients} clients connected`, stats.clients)
}, 30000)
