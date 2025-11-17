import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  const { user: currentUser } = useAuth()
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
      userService.getUsers().then((userList) => {
        setUsers(userList)
        // Se não estiver editando e userId está vazio, seleciona o primeiro usuário
        if (!appointment && !userId && userList.length > 0) {
          setUserId(userList[0].id)
        }
      })
    })
    if (appointment) {
      setTitle(appointment.title || '')
      setDescription(appointment.description || '')
      setClientId(appointment.clientId || '')
      setUserId(appointment.userId || '')
      
      // Converter ISO string para datetime-local format (YYYY-MM-DDTHH:mm)
      if (appointment.startTime) {
        const startDate = new Date(appointment.startTime)
        const localStartTime = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        setStartTime(localStartTime)
      } else {
        setStartTime('')
      }
      
      if (appointment.endTime) {
        const endDate = new Date(appointment.endTime)
        const localEndTime = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        setEndTime(localEndTime)
      } else {
        setEndTime('')
      }
      
      setStatus(appointment.status || 'SCHEDULED')
    } else {
      setTitle('')
      setDescription('')
      setClientId('')
      setUserId(currentUser?.id || '')
      setStartTime('')
      setEndTime('')
      setStatus('SCHEDULED')
    }
  }, [appointment, currentUser])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!title.trim()) {
      alert('Por favor, preencha o título do agendamento.')
      return
    }

    if (!clientId) {
      alert('Por favor, selecione um cliente.')
      return
    }

    // Regex simples para validar UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!userId || !uuidRegex.test(userId)) {
      alert('Por favor, selecione um usuário responsável válido.')
      return
    }

    if (!startTime || !endTime) {
      alert('Por favor, preencha a data e hora de início e fim.')
      return
    }

    // Converter datetime-local para ISO string
    // O input datetime-local retorna formato "YYYY-MM-DDTHH:mm"
    // Precisamos converter para ISO string (UTC)
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    // Validar se as datas são válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Por favor, informe datas e horários válidos.')
      return
    }

    // Validar se o horário de fim é depois do início
    if (endDate <= startDate) {
      alert('O horário de fim deve ser posterior ao horário de início.')
      return
    }

    // Converter para ISO string
    const startTimeISO = startDate.toISOString()
    const endTimeISO = endDate.toISOString()

    onSave({ 
      title: title.trim(), 
      description: description?.trim() || undefined, 
      clientId, 
      userId, 
      startTime: startTimeISO, 
      endTime: endTimeISO, 
      status 
    })
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
        {users.length === 0 ? (
          <div className="text-red-600 font-semibold mb-4">Nenhum usuário disponível para seleção. Verifique se há usuários ativos no sistema.</div>
        ) : null}
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
              disabled={loading || users.length === 0}
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
