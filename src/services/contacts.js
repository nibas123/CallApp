class ContactsService {
  constructor() {
    this.storageKey = 'wifi-calling-contacts'
    this.currentUserKey = 'wifi-calling-current-user'
    this.maxContacts = 5
  }

  // Get all contacts from localStorage
  getContacts() {
    try {
      const contacts = localStorage.getItem(this.storageKey)
      return contacts ? JSON.parse(contacts) : this.getDefaultContacts()
    } catch (error) {
      console.error('Error loading contacts:', error)
      return this.getDefaultContacts()
    }
  }

  // Get default contacts (fallback)
  getDefaultContacts() {
    return [
      { id: 'user1', name: 'John', phone: '+1-555-0101' },
      { id: 'user2', name: 'Mary', phone: '+1-555-0102' },
      { id: 'user3', name: 'Bob', phone: '+1-555-0103' }
    ]
  }

  // Save contacts to localStorage
  saveContacts(contacts) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(contacts))
      return true
    } catch (error) {
      console.error('Error saving contacts:', error)
      return false
    }
  }

  // Add a new contact
  addContact(contact) {
    const contacts = this.getContacts()
    
    if (contacts.length >= this.maxContacts) {
      throw new Error(`Maximum ${this.maxContacts} contacts allowed`)
    }

    // Validate contact
    if (!contact.name || !contact.id) {
      throw new Error('Contact name and ID are required')
    }

    // Check for duplicate ID
    if (contacts.find(c => c.id === contact.id)) {
      throw new Error('Contact ID already exists')
    }

    contacts.push({
      id: contact.id,
      name: contact.name.trim(),
      phone: contact.phone ? contact.phone.trim() : ''
    })

    this.saveContacts(contacts)
    return contact
  }

  // Update an existing contact
  updateContact(contactId, updates) {
    const contacts = this.getContacts()
    const index = contacts.findIndex(c => c.id === contactId)
    
    if (index === -1) {
      throw new Error('Contact not found')
    }

    // Check for duplicate ID if changing ID
    if (updates.id && updates.id !== contactId) {
      if (contacts.find(c => c.id === updates.id)) {
        throw new Error('Contact ID already exists')
      }
    }

    contacts[index] = {
      ...contacts[index],
      ...updates,
      name: updates.name ? updates.name.trim() : contacts[index].name,
      phone: updates.phone !== undefined ? updates.phone.trim() : contacts[index].phone
    }

    this.saveContacts(contacts)
    return contacts[index]
  }

  // Delete a contact
  deleteContact(contactId) {
    const contacts = this.getContacts()
    const filteredContacts = contacts.filter(c => c.id !== contactId)
    
    if (filteredContacts.length === contacts.length) {
      throw new Error('Contact not found')
    }

    this.saveContacts(filteredContacts)
    return true
  }

  // Get current user
  getCurrentUser() {
    try {
      const currentUser = localStorage.getItem(this.currentUserKey)
      return currentUser ? JSON.parse(currentUser) : this.getDefaultContacts()[0]
    } catch (error) {
      console.error('Error loading current user:', error)
      return this.getDefaultContacts()[0]
    }
  }

  // Set current user
  setCurrentUser(user) {
    try {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user))
      return true
    } catch (error) {
      console.error('Error saving current user:', error)
      return false
    }
  }

  // Get available contacts to call (excluding current user)
  getAvailableContacts() {
    const allContacts = this.getContacts()
    const currentUser = this.getCurrentUser()
    return allContacts.filter(contact => contact.id !== currentUser.id)
  }

  // Find contact by ID
  findContact(contactId) {
    const contacts = this.getContacts()
    return contacts.find(c => c.id === contactId) || null
  }

  // Generate unique ID for new contact
  generateContactId() {
    const contacts = this.getContacts()
    let id = 1
    while (contacts.find(c => c.id === `user${id}`)) {
      id++
    }
    return `user${id}`
  }

  // Reset to default contacts
  resetToDefaults() {
    const defaultContacts = this.getDefaultContacts()
    this.saveContacts(defaultContacts)
    this.setCurrentUser(defaultContacts[0])
    return defaultContacts
  }

  // Export contacts as JSON
  exportContacts() {
    return {
      contacts: this.getContacts(),
      currentUser: this.getCurrentUser(),
      exportDate: new Date().toISOString()
    }
  }

  // Import contacts from JSON
  importContacts(data) {
    try {
      if (data.contacts && Array.isArray(data.contacts)) {
        this.saveContacts(data.contacts.slice(0, this.maxContacts))
        if (data.currentUser) {
          this.setCurrentUser(data.currentUser)
        }
        return true
      }
      throw new Error('Invalid contacts data format')
    } catch (error) {
      console.error('Error importing contacts:', error)
      return false
    }
  }
}

export default ContactsService
