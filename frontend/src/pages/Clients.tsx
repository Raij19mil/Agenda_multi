import React, { useState } from 'react'
import ClientForm from '../components/ClientForm'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { clientService } from '../services/clientService'
import { Plus, Search, Edit, Trash2, Phone, Mail, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientType {
  id: string
  name: string
  email?: string
  phone: string
  notes?: string
  isActive: boolean
}

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientType | null>(null)
  const queryClient = useQueryClient()

  const { data: clients, isLoading } = useQuery<ClientType[]>(
    ['clients', searchTerm],
    () => clientService.getClients(searchTerm),
    {
      enabled: true,
    }
  )

  const createMutation = useMutation(
    (data: Omit<ClientType, 'id'>) => clientService.createClient(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients')
        toast.success('Cliente criado com sucesso!')
        setShowForm(false)
      },
      onError: () => {
        toast.error('Erro ao criar cliente!')
      },
    }
  )

  const updateMutation = useMutation(
    (variables: { id: string; data: Omit<ClientType, 'id'> }) => clientService.updateClient(variables.id, variables.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients')
        toast.success('Cliente atualizado com sucesso!')
        setShowForm(false)
      },
      onError: () => {
        toast.error('Erro ao atualizar cliente!')
      },
    }
  )


  function handleSaveClient(data: Omit<ClientType, 'id'>) {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const deleteMutation = useMutation(
    (id: string) => clientService.deleteClient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients')
        toast.success('Cliente removido com sucesso!')
      },
      onError: () => {
        toast.error('Erro ao remover cliente!')
      },
    }
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (client: ClientType) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleNewClient = () => {
    setEditingClient(null)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={() => setShowForm(false)}
          onSave={handleSaveClient}
          loading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
      <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Clientes</h1>
          <p className="text-text-secondary mt-2 text-sm md:text-base">
            Gerencie seus clientes e informações de contato
          </p>
        </div>
        <button
          onClick={handleNewClient}
          className="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Buscar clientes..."
          className="form-input pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clients List - Desktop Table */}
      <div className="hidden md:block bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
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
              {clients?.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text">{client.name}</div>
                    {client.notes && (
                      <div className="text-sm text-text-secondary truncate max-w-xs">{client.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center text-sm text-text-secondary mt-1">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        {client.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {client.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-primary hover:text-primary-dark"
                        aria-label="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-error hover:text-error-dark"
                        aria-label="Excluir cliente"
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

      {/* Clients List - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {clients?.map((client) => (
          <div key={client.id} className="bg-surface rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-medium text-text">{client.name}</h3>
                {client.notes && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{client.notes}</p>
                )}
              </div>
              <span
                className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  client.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {client.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-text-secondary">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center text-sm text-text-secondary">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(client)}
                className="flex-1 flex items-center justify-center px-4 py-2 text-sm text-primary bg-primary-light rounded-md hover:bg-primary-dark hover:text-white transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="flex-1 flex items-center justify-center px-4 py-2 text-sm text-error bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {clients?.length === 0 && (
        <div className="text-center py-12 px-4">
          <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">Nenhum cliente encontrado</h3>
          <p className="text-text-secondary text-sm">
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro cliente.'}
          </p>
        </div>
      )}
    </div>
    </>
  )
}

export default Clients