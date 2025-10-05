import React, { useState, useEffect } from 'react'

interface ClientType {
  id?: string
  name: string
  email?: string
  phone: string
  notes?: string
  isActive: boolean
}

interface ClientFormProps {
  client: ClientType | null
  onClose: () => void
  onSave: (data: Omit<ClientType, 'id'>) => void
  loading?: boolean
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose, onSave, loading }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (client) {
      setName(client.name || '')
      setEmail(client.email || '')
      setPhone(client.phone || '')
      setNotes(client.notes || '')
      setIsActive(client.isActive)
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setNotes('')
      setIsActive(true)
    }
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, email, phone, notes, isActive })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              className="form-input mt-1 block w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              className="form-input mt-1 block w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone *</label>
            <input
              type="text"
              className="form-input mt-1 block w-full"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              className="form-input mt-1 block w-full"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="form-checkbox"
            />
            <label htmlFor="isActive" className="text-sm">Ativo</label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientForm
