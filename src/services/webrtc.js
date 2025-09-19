class WebRTCService extends EventTarget {
  constructor() {
    super()
    this.peerConnection = null
    this.localStream = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Get user media with audio only
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      })

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0]
        this.playRemoteStream(remoteStream)
      }

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.dispatchEvent(new CustomEvent('ice-candidate', {
            detail: event.candidate
          }))
        }
      }

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState
        console.log('Connection state:', state)
        
        if (state === 'connected') {
          this.dispatchEvent(new CustomEvent('connected'))
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          this.dispatchEvent(new CustomEvent('ended'))
        }
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error)
      throw error
    }
  }

  async createOffer() {
    await this.initialize()
    
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    })
    
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async handleIncomingCall(offerData) {
    await this.initialize()
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerData.offer))
    
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    return answer
  }

  async handleCallAnswered(answerData) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerData.answer))
  }

  async handleIceCandidate(candidateData) {
    if (!this.peerConnection) return
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidateData.candidate))
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  playRemoteStream(stream) {
    // Create audio element for remote stream
    const audio = document.createElement('audio')
    audio.srcObject = stream
    audio.autoplay = true
    audio.controls = false
    
    // Force speakerphone on mobile devices
    if (audio.setSinkId) {
      audio.setSinkId('default').catch(console.error)
    }
    
    // Set volume to maximum and enable speakerphone
    audio.volume = 1.0
    
    // Add to DOM (hidden)
    audio.style.display = 'none'
    document.body.appendChild(audio)
    
    // Store reference for cleanup
    this.remoteAudio = audio
  }

  endCall() {
    if (this.remoteAudio) {
      this.remoteAudio.remove()
      this.remoteAudio = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.isInitialized = false
    this.dispatchEvent(new CustomEvent('ended'))
  }

  cleanup() {
    this.endCall()
  }

  // Event helper methods
  on(event, callback) {
    this.addEventListener(event, (e) => callback(e.detail))
  }

  off(event, callback) {
    this.removeEventListener(event, callback)
  }
}

export default WebRTCService
