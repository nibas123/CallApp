import { useState, useEffect, useRef } from 'react'
import WebRTCService from './services/webrtc'
import WebSocketService from './services/websocket'
import RenderWakeupService from './services/renderWakeup'
import ContactsService from './services/contacts'
import ContactsManager from './components/ContactsManager'

// Remove hardcoded users - now using dynamic contacts system

function App() {
  const [callState, setCallState] = useState('idle') // 'idle', 'calling', 'connected', 'ended'
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showContacts, setShowContacts] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [targetContact, setTargetContact] = useState(null)
  const [availableContacts, setAvailableContacts] = useState([])
  
  const webrtcRef = useRef(null)
  const wsRef = useRef(null)
  const wakeupRef = useRef(null)
  const contactsRef = useRef(null)
  const callTimerRef = useRef(null)

  useEffect(() => {
    // Initialize contacts service
    contactsRef.current = new ContactsService()
    const user = contactsRef.current.getCurrentUser()
    const contacts = contactsRef.current.getAvailableContacts()
    setCurrentUser(user)
    setAvailableContacts(contacts)
    setTargetContact(contacts[0] || null)

    // Initialize services
    wsRef.current = new WebSocketService()
    webrtcRef.current = new WebRTCService()
    wakeupRef.current = new RenderWakeupService()

    // Set up wake-up service
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
    wakeupRef.current.setWakeupUrl(wsUrl)

    // Start wake-up process for production
    if (wsUrl.includes('onrender.com')) {
      setIsWakingUp(true)
      wakeupRef.current.wakeupRender().then(() => {
        setIsWakingUp(false)
        // Connect after wake-up
        wsRef.current.connect(CURRENT_USER.id)
      }).catch(() => {
        setIsWakingUp(false)
        // Try to connect anyway
        wsRef.current.connect(CURRENT_USER.id)
      })
    } else {
      // Local development - connect immediately
      wsRef.current.connect(CURRENT_USER.id)
    }

    // WebSocket event handlers
    wsRef.current.on('connected', () => {
      setIsConnected(true)
      setError('')
    })

    wsRef.current.on('disconnected', () => {
      setIsConnected(false)
    })

    wsRef.current.on('error', (err) => {
      setError(`Connection error: ${err}`)
    })

    wsRef.current.on('incoming-call', async (data) => {
      if (callState === 'idle') {
        setCallState('calling')
        try {
          const answer = await webrtcRef.current.handleIncomingCall(data)
          wsRef.current.sendCallAnswer(data.from, answer)
        } catch (err) {
          setError(`Call error: ${err.message}`)
          setCallState('idle')
        }
      }
    })

    wsRef.current.on('call-answered', async (data) => {
      try {
        await webrtcRef.current.handleCallAnswered(data)
        setCallState('connected')
      } catch (err) {
        setError(`Call error: ${err.message}`)
        setCallState('idle')
      }
    })

    wsRef.current.on('ice-candidate', (data) => {
      webrtcRef.current.handleIceCandidate(data)
    })

    wsRef.current.on('call-ended', () => {
      handleEndCall()
    })

    // WebRTC event handlers
    webrtcRef.current.on('ice-candidate', (candidate) => {
      if (targetContact) {
        wsRef.current.sendIceCandidate(targetContact.id, candidate)
      }
    })

    webrtcRef.current.on('connected', () => {
      setCallState('connected')
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    })

    webrtcRef.current.on('ended', () => {
      setCallState('ended')
      // Stop call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
      setTimeout(() => {
        setCallState('idle')
        setCallDuration(0)
      }, 2000)
    })

    // Connect to WebSocket server - moved to wake-up logic above

    return () => {
      if (wsRef.current) wsRef.current.disconnect()
      if (webrtcRef.current) webrtcRef.current.cleanup()
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [])

  const handleStartCall = async () => {
    if (!isConnected || !targetContact) {
      setError(targetContact ? 'Not connected to server' : 'No contact selected')
      return
    }

    setCallState('calling')
    setError('')

    try {
      const offer = await webrtcRef.current.createOffer()
      wsRef.current.sendCallOffer(targetContact.id, offer)
    } catch (err) {
      setError(`Failed to start call: ${err.message}`)
      setCallState('idle')
    }
  }

  const handleEndCall = () => {
    if (callState !== 'idle' && targetContact) {
      wsRef.current.sendEndCall(targetContact.id)
      webrtcRef.current.endCall()
      setCallState('ended')
      // Stop call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
        callTimerRef.current = null
      }
      setTimeout(() => {
        setCallState('idle')
        setCallDuration(0)
      }, 2000)
    }
  }

  // Helper functions for contacts management
  const refreshContacts = () => {
    if (contactsRef.current) {
      const user = contactsRef.current.getCurrentUser()
      const contacts = contactsRef.current.getAvailableContacts()
      setCurrentUser(user)
      setAvailableContacts(contacts)
      
      // Update target contact if current one is no longer available
      if (targetContact && !contacts.find(c => c.id === targetContact.id)) {
        setTargetContact(contacts[0] || null)
      }
      
      // Reconnect WebSocket with new user ID if changed
      if (wsRef.current && user.id !== currentUser?.id) {
        wsRef.current.disconnect()
        wsRef.current.connect(user.id)
      }
    }
  }

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCallStatusText = () => {
    switch (callState) {
      case 'calling': return 'Calling...'
      case 'connected': return `In Call - ${formatDuration(callDuration)}`
      case 'ended': return 'Call Ended'
      default: return ''
    }
  }

  const getConnectionStatusText = () => {
    if (isWakingUp) return 'Waking up server...'
    if (!isConnected) return 'Connecting...'
    return ''
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-6 text-center border-b border-gray-700">
        <h1 className="text-4xl md:text-5xl font-bold">Call App</h1>
        <p className="text-xl md:text-2xl mt-2 text-gray-300">
          {getConnectionStatusText() || `Ready to call ${CONTACT.name}`}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        {callState === 'idle' ? (
          /* Home Screen - Contact Selection & Call Button */
          <div className="text-center">
            {targetContact ? (
              <div className="mb-8">
                <div className="text-6xl md:text-8xl mb-4">📞</div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-2">
                  {targetContact.name}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300">
                  Tap to call
                </p>
                {targetContact.phone && (
                  <p className="text-lg text-gray-400 mt-1">
                    {targetContact.phone}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-8">
                <div className="text-6xl md:text-8xl mb-4">👥</div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-2">
                  No Contacts
                </h2>
                <p className="text-xl md:text-2xl text-gray-300">
                  Add contacts to start calling
                </p>
              </div>
            )}
            
            {/* Contact Selection (if multiple contacts) */}
            {availableContacts.length > 1 && (
              <div className="mb-6">
                <select
                  value={targetContact?.id || ''}
                  onChange={(e) => {
                    const contact = availableContacts.find(c => c.id === e.target.value)
                    setTargetContact(contact || null)
                  }}
                  className="bg-gray-700 text-white text-xl p-3 rounded-lg border border-gray-600"
                >
                  {availableContacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={handleStartCall}
              disabled={!isConnected || isWakingUp || !targetContact}
              className={`
                w-64 h-64 md:w-80 md:h-80 rounded-full text-white font-bold text-2xl md:text-3xl
                transition-all duration-200 touch-target high-contrast
                ${isConnected && !isWakingUp && targetContact
                  ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-600 cursor-not-allowed'
                }
              `}
            >
              {isWakingUp ? 'Waking up...' : 
               !targetContact ? 'No Contact' :
               isConnected ? `Call ${targetContact.name}` : 'Connecting...'}
            </button>
            
            {/* Manage Contacts Button */}
            <button
              onClick={() => setShowContacts(true)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
            >
              Manage Contacts
            </button>
          </div>
        ) : (
          /* Call Screen */
          <div className="text-center">
            <div className="mb-8">
              <div className="text-6xl md:text-8xl mb-4">
                {callState === 'connected' ? '🔊' : '📞'}
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-2">
                {targetContact?.name || 'Unknown'}
              </h2>
              <p className="text-2xl md:text-3xl text-gray-300">
                {getCallStatusText()}
              </p>
              {callState === 'connected' && (
                <>
                  <p className="text-lg md:text-xl text-green-400 mt-2">
                    🔊 Speakerphone ON
                  </p>
                  <p className="text-xl md:text-2xl text-blue-400 mt-2">
                    {formatCallDuration(callDuration)}
                  </p>
                </>
              )}
            </div>
            
            {callState !== 'ended' && (
              <button
                onClick={handleEndCall}
                className="
                  w-48 h-48 md:w-64 md:h-64 rounded-full bg-red-500 hover:bg-red-600 
                  active:bg-red-700 text-white font-bold text-xl md:text-2xl
                  transition-all duration-200 shadow-lg hover:shadow-xl touch-target high-contrast
                "
              >
                End Call
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-600 text-white p-4 text-center">
          <p className="text-lg md:text-xl font-semibold">{error}</p>
          <button 
            onClick={() => setError('')}
            className="mt-2 px-4 py-2 bg-red-700 rounded text-base md:text-lg hover:bg-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 p-4 text-center border-t border-gray-700">
        <p className="text-sm md:text-base text-gray-400">
          User: {currentUser?.name || 'Unknown'} ({currentUser?.id || 'N/A'})
        </p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs md:text-sm text-gray-400">
            {isWakingUp ? 'Waking server...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {availableContacts.length} contact{availableContacts.length !== 1 ? 's' : ''} available
        </p>
        {callState === 'connected' && (
          <p className="text-xs md:text-sm text-blue-400 mt-1">
            📞 Call time: {formatCallDuration(callDuration)}
          </p>
        )}
      </div>

      {/* Contacts Manager Modal */}
      {showContacts && (
        <ContactsManager
          contactsService={contactsRef.current}
          onContactsChange={refreshContacts}
          onClose={() => setShowContacts(false)}
        />
      )}
    </div>
  )
}

export default App
