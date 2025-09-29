import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Search, Edit, Trash2, Building2, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const Tenants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [, setShowForm] = useState(false)
  const [, setEditingTenant] = useState<any>(null)
  const queryClient = useQueryClient()

  // Mock data - substitua pela chamada real da API
  const { data: tenants, isLoading } = useQuery(
    ['tenants', searchTerm],
    () => Promise.resolve([
      {
        id: '1',
        name: 'Barbearia do João',
        slug: 'barbearia-joao',
        theme: 'barbearia',
        isActive: true,
        createdAt: '2024-01-01',
        _count: {
          users: 3,
          clients: 45,
          appointments: 120
        }
      },
      {
        id: '2',
        name: 'Salão da Maria',
        slug: 'salao-maria',
        theme: 'salao',
        isActive: true,
        createdAt: '2024-01-15',
        _count: {
          users: 2,
          clients: 30,
          appointments: 85
        }
      }
    ]),
    {
      enabled: true,
    }
  )

  const deleteMutation = useMutation(
    (_id: string) => Promise.resolve(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tenants')
        toast.success('Tenant removido com sucesso!')
      },
      onError: () => {
        toast.error('Erro ao remover tenant!')
      },
    }
  )

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este tenant?')) {
      deleteMutation.mutate(id)
    }
  }

  const getThemeColor = (theme: string) => {
    const colors = {
      barbearia: 'bg-green-100 text-green-800',
      salao: 'bg-pink-100 text-pink-800',
      clinica: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800',
    }
    return colors[theme as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getThemeText = (theme: string) => {
    const texts = {
      barbearia: 'Barbearia',
      salao: 'Salão de Beleza',
      clinica: 'Clínica',
      default: 'Padrão',
    }
    return texts[theme as keyof typeof texts] || theme
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Tenants</h1>
          <p className="text-text-secondary mt-2">
            Gerencie todos os tenants do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Tenant
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Buscar tenants..."
          className="form-input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants?.map((tenant) => (
          <div key={tenant.id} className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-text">{tenant.name}</h3>
                  <p className="text-sm text-text-secondary">/{tenant.slug}</p>
                </div>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getThemeColor(tenant.theme)}`}
              >
                {getThemeText(tenant.theme)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-lg font-semibold text-text">{tenant._count?.users || 0}</div>
                <div className="text-xs text-text-secondary">Usuários</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-lg font-semibold text-text">{tenant._count?.clients || 0}</div>
                <div className="text-xs text-text-secondary">Clientes</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-lg font-semibold text-text">{tenant._count?.appointments || 0}</div>
                <div className="text-xs text-text-secondary">Agendamentos</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  tenant.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tenant.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTenant(tenant)}
                  className="text-primary hover:text-primary-dark"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tenant.id)}
                  className="text-error hover:text-error-dark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tenants?.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">Nenhum tenant encontrado</h3>
          <p className="text-text-secondary">
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece criando seu primeiro tenant.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Tenants
