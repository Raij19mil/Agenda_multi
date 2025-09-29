import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar' // ← adicionado View
import { useQuery } from 'react-query'
import { appointmentService } from '../services/appointmentService'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'moment/locale/pt-br'

const localizer = momentLocalizer(moment)

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')

  // ✅ Função de adaptação para o onView
  const handleViewChange = (view: View) => {
    if (view === 'month' || view === 'week' || view === 'day' || view === 'agenda') {
      setCurrentView(view)
    }
    // Opcional: tratar "work_week" como "week"
    // else if (view === 'work_week') {
    //   setCurrentView('week')
    // }
  }

  const { data: appointments, isLoading } = useQuery(
    ['calendar', currentDate.getMonth() + 1, currentDate.getFullYear()],
    () => appointmentService.getCalendarData(currentDate.getMonth() + 1, currentDate.getFullYear()),
    {
      enabled: true,
    }
  )

  const events = appointments?.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: new Date(appointment.startTime),
    end: new Date(appointment.endTime),
    resource: appointment,
  })) || []

  const eventStyleGetter = (event: any) => {
    const status = event.resource?.status
    let backgroundColor = '#3B82F6' // Default blue

    switch (status) {
      case 'CONFIRMED':
        backgroundColor = '#10B981' // Green
        break
      case 'IN_PROGRESS':
        backgroundColor = '#F59E0B' // Yellow
        break
      case 'COMPLETED':
        backgroundColor = '#6B7280' // Gray
        break
      case 'CANCELLED':
        backgroundColor = '#EF4444' // Red
        break
      case 'NO_SHOW':
        backgroundColor = '#F97316' // Orange
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
      },
    }
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
      <div>
        <h1 className="text-3xl font-bold text-text">Calendário</h1>
        <p className="text-text-secondary mt-2">
          Visualize seus agendamentos em formato de calendário
        </p>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                currentView === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                currentView === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                currentView === 'day' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setCurrentView('agenda')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                currentView === 'agenda' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        <div style={{ height: '600px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={handleViewChange} // ✅ Alterado aqui!
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Lista',
              date: 'Data',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'Nenhum evento neste período',
              showMore: (total) => `+${total} mais`,
            }}
            culture="pt-BR"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-text mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Agendado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Confirmado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Em Andamento</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Concluído</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Cancelado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span className="text-sm text-text-secondary">Não Compareceu</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar