import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { appointmentService } from '../services/appointmentService'
import { CreateAppointmentRequest } from '../types'
import { Plus, Search, Edit, Trash2, Calendar, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AppointmentForm from '../components/AppointmentForm'

const Appointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)

  const queryClient = useQueryClient()

  const createMutation = useMutation(
    (data: CreateAppointmentRequest) => appointmentService.createAppointment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
        toast.success('Agendamento criado com sucesso!')
        setShowForm(false)
      },
      onError: () => {
        toast.error('Erro ao criar agendamento!')
      },
    }
  )

  const updateMutation = useMutation(
    (variables: { id: string; data: CreateAppointmentRequest }) => appointmentService.updateAppointment(variables.id, variables.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments')
        toast.success('Agendamento atualizado com sucesso!')
        setShowForm(false)
      },
      onError: () => {
        toast.error('Erro ao atualizar agendamento!')
      },
    }
  )

  function handleSaveAppointment(data: CreateAppointmentRequest) {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const { data: appointments, isLoading } = useQuery(
    ['appointments', { search: searchTerm, status: statusFilter }],
    () => appointmentService.getAppointments({ search: searchTerm, status: statusFilter }),
    {
      enabled: true,
    }
  )

  const deleteMutation = useMutation(appointmentService.deleteAppointment, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments')
      toast.success('Agendamento removido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao remover agendamento!')
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este agendamento?')) {
      deleteMutation.mutate(id)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não Compareceu',
    }
    return texts[status as keyof typeof texts] || status
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
{showForm && (
  <AppointmentForm
    appointment={editingAppointment}
    onClose={() => setShowForm(false)}
    onSave={handleSaveAppointment}
    loading={createMutation.isLoading || updateMutation.isLoading}
  />
)}
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Agendamentos</h1>
          <p className="text-text-secondary mt-2">
            Gerencie todos os seus agendamentos
          </p>
        </div>
        <button
          onClick={() => {
          setEditingAppointment(null)
           setShowForm(true)
    }}
             className="btn-primary flex items-center"
         >
         <Plus className="w-5 h-5 mr-2" />
         Novo Agendamento
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Buscar agendamentos..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input w-48"
        >
          <option value="">Todos os status</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="IN_PROGRESS">Em Andamento</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="NO_SHOW">Não Compareceu</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments?.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text">{appointment.client.name}</div>
                    <div className="text-sm text-text-secondary">{appointment.client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text">{appointment.title}</div>
                    {appointment.description && (
                      <div className="text-sm text-text-secondary">{appointment.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(appointment.startTime), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-sm text-text-secondary mt-1">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })} - {format(new Date(appointment.endTime), 'HH:mm', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text">
                      <User className="w-4 h-4 mr-2" />
                      {appointment.user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
  onClick={() => {
    setEditingAppointment(appointment)
    setShowForm(true)
  }}
  className="text-primary hover:text-primary-dark"
>
  <Edit className="w-4 h-4" />
</button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-error hover:text-error-dark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {appointments?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-text-secondary">
            {searchTerm || statusFilter ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro agendamento.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Appointments
