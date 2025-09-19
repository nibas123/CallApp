import { useState } from 'react'

function ContactsManager({ contactsService, onContactsChange, onClose }) {
  const [contacts, setContacts] = useState(contactsService.getContacts())
  const [currentUser, setCurrentUser] = useState(contactsService.getCurrentUser())
  const [isEditing, setIsEditing] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [error, setError] = useState('')

  const refreshContacts = () => {
    const updatedContacts = contactsService.getContacts()
    const updatedCurrentUser = contactsService.getCurrentUser()
    setContacts(updatedContacts)
    setCurrentUser(updatedCurrentUser)
    onContactsChange()
  }

  const handleAddContact = () => {
    const newId = contactsService.generateContactId()
    setEditingContact({
      id: newId,
      name: '',
      phone: ''
    })
    setIsEditing(true)
    setError('')
  }

  const handleEditContact = (contact) => {
    setEditingContact({ ...contact })
    setIsEditing(true)
    setError('')
  }

  const handleSaveContact = () => {
    if (!editingContact.name.trim()) {
      setError('Contact name is required')
      return
    }

    try {
      const existingContact = contactsService.findContact(editingContact.id)
      
      if (existingContact) {
        contactsService.updateContact(editingContact.id, editingContact)
      } else {
        contactsService.addContact(editingContact)
      }
      
      setIsEditing(false)
      setEditingContact(null)
      setError('')
      refreshContacts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteContact = (contactId) => {
    if (contactId === currentUser.id) {
      setError('Cannot delete current user')
      return
    }

    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        contactsService.deleteContact(contactId)
        refreshContacts()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleSetCurrentUser = (contact) => {
    contactsService.setCurrentUser(contact)
    setCurrentUser(contact)
    refreshContacts()
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingContact(null)
    setError('')
  }

  const handleExport = () => {
    const data = contactsService.exportContacts()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wifi-calling-contacts.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (contactsService.importContacts(data)) {
          refreshContacts()
          setError('')
        } else {
          setError('Failed to import contacts')
        }
      } catch (err) {
        setError('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Manage Contacts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Current User */}
        <div className="bg-green-900 p-3 rounded mb-4">
          <h3 className="text-green-200 font-semibold mb-2">Current User</h3>
          <div className="text-white">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-sm text-green-200">{currentUser.id}</div>
          </div>
        </div>

        {/* Add Contact */}
        {!isEditing && (
          <button
            onClick={handleAddContact}
            disabled={contacts.length >= 5}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-3 rounded mb-4 font-semibold"
          >
            {contacts.length >= 5 ? 'Maximum 5 Contacts' : 'Add New Contact'}
          </button>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-gray-700 p-4 rounded mb-4">
            <h3 className="text-white font-semibold mb-3">
              {contactsService.findContact(editingContact.id) ? 'Edit Contact' : 'Add Contact'}
            </h3>
            
            <input
              type="text"
              placeholder="Contact Name"
              value={editingContact.name}
              onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
              className="w-full p-2 rounded bg-gray-600 text-white mb-3"
            />
            
            <input
              type="text"
              placeholder="Phone (optional)"
              value={editingContact.phone}
              onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
              className="w-full p-2 rounded bg-gray-600 text-white mb-3"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveContact}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="space-y-2 mb-4">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-gray-700 p-3 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-white">{contact.name}</div>
                  <div className="text-sm text-gray-300">{contact.id}</div>
                  {contact.phone && (
                    <div className="text-sm text-gray-400">{contact.phone}</div>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  {contact.id !== currentUser.id && (
                    <button
                      onClick={() => handleSetCurrentUser(contact)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded"
                      title="Set as current user"
                    >
                      Use
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 text-xs rounded"
                    title="Edit contact"
                  >
                    Edit
                  </button>
                  
                  {contact.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded"
                      title="Delete contact"
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Import/Export */}
        <div className="border-t border-gray-600 pt-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-sm"
            >
              Export Contacts
            </button>
            
            <label className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded text-sm text-center cursor-pointer">
              Import Contacts
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          
          <button
            onClick={() => {
              if (confirm('Reset to default contacts? This will delete all custom contacts.')) {
                contactsService.resetToDefaults()
                refreshContacts()
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactsManager
