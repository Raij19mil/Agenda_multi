import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Save, Palette, User, Shield, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings: React.FC = () => {
  const { user } = useAuth()
  const { theme, updateTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme?.name || 'default')
  const [loading, setLoading] = useState(false)

  const availableThemes = [
    { key: 'barbearia', name: 'Barbearia', description: 'Tema verde escuro para barbearias' },
    { key: 'salao', name: 'Salão de Beleza', description: 'Tema rosa claro para salões' },
    { key: 'clinica', name: 'Clínica', description: 'Tema branco e rosa claro para clínicas' },
    { key: 'default', name: 'Padrão', description: 'Tema padrão azul' },
  ]

  const handleThemeChange = async (themeKey: string) => {
    try {
      setLoading(true)
      await updateTheme(themeKey)
      setSelectedTheme(themeKey)
      toast.success('Tema atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar tema!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Configurações</h1>
        <p className="text-text-secondary mt-2">
          Gerencie as configurações da sua conta e do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-text">Tema</h2>
          </div>
          <p className="text-text-secondary mb-4">
            Escolha o tema que melhor representa seu negócio
          </p>
          
          <div className="space-y-3">
            {availableThemes.map((themeOption) => (
              <div
                key={themeOption.key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTheme === themeOption.key
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeChange(themeOption.key)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text">{themeOption.name}</h3>
                    <p className="text-sm text-text-secondary">{themeOption.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: themeOption.key === 'barbearia' ? '#2D5016' :
                                        themeOption.key === 'salao' ? '#E91E63' :
                                        themeOption.key === 'clinica' ? '#FFFFFF' :
                                        '#3B82F6'
                      }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: themeOption.key === 'barbearia' ? '#4A7C59' :
                                        themeOption.key === 'salao' ? '#F8BBD9' :
                                        themeOption.key === 'clinica' ? '#F8F9FA' :
                                        '#6B7280'
                      }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: themeOption.key === 'barbearia' ? '#8FBC8F' :
                                        themeOption.key === 'salao' ? '#FCE4EC' :
                                        themeOption.key === 'clinica' ? '#E3F2FD' :
                                        '#E5E7EB'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-text">Informações do Usuário</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Nome</label>
              <input
                type="text"
                value={user?.name || ''}
                className="form-input"
                disabled
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="form-input"
                disabled
              />
            </div>
            <div>
              <label className="form-label">Função</label>
              <input
                type="text"
                value={
                  user?.role === 'SUPERADMIN' ? 'Super Administrador' :
                  user?.role === 'ADMIN' ? 'Administrador' :
                  user?.role === 'AGENT' ? 'Agente' : ''
                }
                className="form-input"
                disabled
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-text">Configurações do Sistema</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text">Notificações por Email</h3>
                <p className="text-sm text-text-secondary">Receber notificações por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text">Notificações Push</h3>
                <p className="text-sm text-text-secondary">Receber notificações no navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-text">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text">Novos Agendamentos</h3>
                <p className="text-sm text-text-secondary">Notificar sobre novos agendamentos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text">Lembretes</h3>
                <p className="text-sm text-text-secondary">Lembretes antes dos agendamentos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
