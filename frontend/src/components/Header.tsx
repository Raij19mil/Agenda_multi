import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, User } from 'lucide-react'

const Header: React.FC = () => {
  const { user } = useAuth()

  // Função auxiliar para obter o texto do cargo
  const getRoleText = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'Super Administrador'
      case 'ADMIN':
        return 'Administrador'
      case 'AGENT':
        return 'Agente'
      default:
        return 'Usuário'
    }
  }

  // Validação: se user for null, mostrar placeholder
  if (!user) {
    return (
      <header className="bg-surface border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">
              Carregando...
            </h2>
            <p className="text-text-secondary">Aguarde</p>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-surface border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text">
            Bem-vindo, {user.name || 'Usuário'}!
          </h2>
          <p className="text-text-secondary">
            {getRoleText(user.role)}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-text-secondary hover:text-text transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-text">{user.name || 'Usuário'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
