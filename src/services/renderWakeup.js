class RenderWakeupService {
  constructor() {
    this.wakeupUrl = null
    this.isWakingUp = false
    this.wakeupAttempts = 0
    this.maxWakeupAttempts = 3
  }

  setWakeupUrl(wsUrl) {
    // Convert WebSocket URL to HTTP URL for wake-up ping
    if (wsUrl) {
      this.wakeupUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://') + '/health'
    }
  }

  async wakeupRender() {
    if (!this.wakeupUrl || this.isWakingUp) {
      return false
    }

    this.isWakingUp = true
    this.wakeupAttempts = 0

    console.log('Waking up Render service...')

    try {
      while (this.wakeupAttempts < this.maxWakeupAttempts) {
        this.wakeupAttempts++
        
        try {
          const response = await fetch(this.wakeupUrl, {
            method: 'GET',
            timeout: 10000 // 10 second timeout
          })
          
          if (response.ok) {
            console.log('Render service is awake!')
            this.isWakingUp = false
            return true
          }
        } catch (error) {
          console.log(`Wake-up attempt ${this.wakeupAttempts} failed:`, error.message)
          
          if (this.wakeupAttempts < this.maxWakeupAttempts) {
            // Wait 2 seconds before next attempt
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
      
      console.log('Could not wake up Render service after', this.maxWakeupAttempts, 'attempts')
      this.isWakingUp = false
      return false
      
    } catch (error) {
      console.error('Wake-up service error:', error)
      this.isWakingUp = false
      return false
    }
  }

  getWakeupStatus() {
    return {
      isWakingUp: this.isWakingUp,
      attempts: this.wakeupAttempts,
      maxAttempts: this.maxWakeupAttempts
    }
  }
}

export default RenderWakeupService
