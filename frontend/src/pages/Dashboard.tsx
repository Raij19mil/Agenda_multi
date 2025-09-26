import React from 'react'
import { useQuery } from 'react-query'
import { appointmentService } from '../services/appointmentService'
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery(
    'dashboard-stats',
    () => appointmentService.getDashboardStats(),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Agendamentos',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'bg-primary',
    },
    {
      title: 'Confirmados',
      value: stats?.statusCounts?.CONFIRMED || 0,
      icon: CheckCircle,
      color: 'bg-success',
    },
    {
      title: 'Em Andamento',
      value: stats?.statusCounts?.IN_PROGRESS || 0,
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: 'Concluídos',
      value: stats?.statusCounts?.COMPLETED || 0,
      icon: CheckCircle,
      color: 'bg-success',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Visão geral dos seus agendamentos e estatísticas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">{card.title}</p>
                  <p className="text-2xl font-bold text-text">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Agendamentos por Status</h3>
          <div className="space-y-3">
            {stats?.statusCounts && Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-text-secondary capitalize">
                  {status.toLowerCase().replace('_', ' ')}
                </span>
                <span className="font-semibold text-text">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {stats?.dailyStats?.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-secondary">
                  {new Date(day.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="font-semibold text-text">{day.count} agendamentos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
