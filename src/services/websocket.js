class WebSocketService extends EventTarget {
  constructor() {
    super()
    this.ws = null
    this.userId = null
    this.isConnected = false
    this.reconnectTimeout = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000
  }

  connect(userId) {
    this.userId = userId
    this.isConnected = false
    
    // Use environment variable for WebSocket URL, fallback to localhost
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Register user with server
        this.send({
          type: 'register',
          userId: this.userId
        })
        
        this.dispatchEvent(new CustomEvent('connected'))
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.dispatchEvent(new CustomEvent('disconnected'))
        
        // Attempt to reconnect
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.dispatchEvent(new CustomEvent('error', { detail: 'Connection failed' }))
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.dispatchEvent(new CustomEvent('error', { detail: error.message }))
    }
  }

  attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.userId)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: 'Failed to reconnect after multiple attempts' 
      }))
    }
  }

  handleMessage(message) {
    console.log('Received message:', message)
    
    switch (message.type) {
      case 'call-offer':
        this.dispatchEvent(new CustomEvent('incoming-call', { detail: message }))
        break
      
      case 'call-answer':
        this.dispatchEvent(new CustomEvent('call-answered', { detail: message }))
        break
      
      case 'ice-candidate':
        this.dispatchEvent(new CustomEvent('ice-candidate', { detail: message }))
        break
      
      case 'call-end':
        this.dispatchEvent(new CustomEvent('call-ended', { detail: message }))
        break
      
      case 'error':
        this.dispatchEvent(new CustomEvent('error', { detail: message.message }))
        break
      
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
      this.dispatchEvent(new CustomEvent('error', { detail: 'Not connected to server' }))
    }
  }

  sendCallOffer(targetUserId, offer) {
    this.send({
      type: 'call-offer',
      from: this.userId,
      to: targetUserId,
      offer: offer
    })
  }

  sendCallAnswer(targetUserId, answer) {
    this.send({
      type: 'call-answer',
      from: this.userId,
      to: targetUserId,
      answer: answer
    })
  }

  sendIceCandidate(targetUserId, candidate) {
    this.send({
      type: 'ice-candidate',
      from: this.userId,
      to: targetUserId,
      candidate: candidate
    })
  }

  sendEndCall(targetUserId) {
    this.send({
      type: 'call-end',
      from: this.userId,
      to: targetUserId
    })
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.userId = null
  }

  // Event helper methods
  on(event, callback) {
    this.addEventListener(event, (e) => callback(e.detail))
  }

  off(event, callback) {
    this.removeEventListener(event, callback)
  }
}

export default WebSocketService
