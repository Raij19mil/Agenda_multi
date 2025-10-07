import React, { useState, useEffect } from 'react'
import { User } from '../types'
import { clientService } from '../services/clientService'
import { Client } from '../types'

interface AppointmentFormProps {
  appointment: AppointmentType | null
  onClose: () => void
  onSave: (data: Omit<AppointmentType, 'id'>) => void
  loading?: boolean
}

interface AppointmentType {
  id?: string
  title: string
  description?: string
  clientId: string
  userId: string
  startTime: string
  endTime: string
  status: string
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onClose, onSave, loading }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [userId, setUserId] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState('SCHEDULED')

  useEffect(() => {
    // Buscar clientes e usuários ao abrir o formulário
    clientService.getClients().then(setClients)
    import('../services/userService').then(({ userService }) => {
      userService.getUsers().then(setUsers)
    })
    if (appointment) {
      setTitle(appointment.title || '')
      setDescription(appointment.description || '')
      setClientId(appointment.clientId || '')
      setUserId(appointment.userId || '')
      setStartTime(appointment.startTime || '')
      setEndTime(appointment.endTime || '')
      setStatus(appointment.status || 'SCHEDULED')
    } else {
      setTitle('')
      setDescription('')
      setClientId('')
      setUserId('')
      setStartTime('')
      setEndTime('')
      setStatus('SCHEDULED')
    }
  }, [appointment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, description, clientId, userId, startTime, endTime, status })
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
        <h2 className="text-xl font-bold mb-4">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              className="form-input mt-1 block w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              className="form-input mt-1 block w-full"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente *</label>
            <select
              className="form-input mt-1 block w-full"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuário Responsável *</label>
            <select
              className="form-input mt-1 block w-full"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Início *</label>
              <input
                type="datetime-local"
                className="form-input mt-1 block w-full"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Fim *</label>
              <input
                type="datetime-local"
                className="form-input mt-1 block w-full"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="form-input mt-1 block w-full"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="NO_SHOW">Não Compareceu</option>
            </select>
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

export default AppointmentForm
