import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings,
  Building2,
  LogOut
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clients', icon: Users, label: 'Clientes' },
    { path: '/appointments', icon: Calendar, label: 'Agendamentos' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
  ]

  if (user?.role === 'SUPERADMIN') {
    menuItems.push(
      { path: '/users', icon: UserCheck, label: 'Usuários' },
      { path: '/tenants', icon: Building2, label: 'Tenants' }
    )
  }

  menuItems.push({ path: '/settings', icon: Settings, label: 'Configurações' })

  return (
    <div className="w-64 bg-surface border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Agendamento</h1>
        <p className="text-sm text-text-secondary mt-1">Sistema Multi-Tenancy</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-accent hover:text-text'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-text-secondary hover:text-error transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  )
}

export default Sidebar
