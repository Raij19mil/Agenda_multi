import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UserType {
  id?: string
  name: string
  email: string
  role: string
  tenantId?: string
  isActive: boolean
  password?: string
}

interface UserFormProps {
  user: UserType | null
  onClose: () => void
  onSave: (data: any) => void
  loading?: boolean
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, loading }) => {
  const { user: currentUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('AGENT')
  const [tenantId, setTenantId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setRole(user.role || 'AGENT')
      setTenantId(user.tenantId || currentUser?.tenantId || '')
      setIsActive(user.isActive ?? true)
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setRole('AGENT')
      setTenantId(currentUser?.tenantId || '')
      setIsActive(true)
      setPassword('')
    }
  }, [user, currentUser])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!name.trim()) {
      alert('O nome é obrigatório.')
      return
    }
    
    if (!email.trim()) {
      alert('O email é obrigatório.')
      return
    }
    
    if (!user && !password.trim()) {
      alert('A senha é obrigatória para novos usuários.')
      return
    }
    
    if (!user && password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    
    if (!tenantId.trim()) {
      alert('O Tenant ID é obrigatório.')
      return
    }

    const data: any = {
      name: name.trim(),
      email: email.trim(),
      role,
      tenantId: tenantId.trim(),
      isActive
    }
    
    // Só envia senha se for criação
    if (!user) {
      data.password = password
    }
    
    console.log('Dados do usuário a enviar:', data)
    onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          aria-label="Fechar"
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              className="form-input mt-1 block w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="Nome completo do usuário"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              className="form-input mt-1 block w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={100}
              placeholder="email@exemplo.com"
            />
          </div>
          
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha *</label>
              <input
                type="password"
                className="form-input mt-1 block w-full"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-xs text-gray-500 mt-1">A senha deve ter no mínimo 6 caracteres</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Função *</label>
            <select
              className="form-input mt-1 block w-full"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="AGENT">Agente</option>
              <option value="ADMIN">Administrador</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Agente: acesso básico | Admin: gerencia usuários | Super Admin: acesso total
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant ID *</label>
            <input
              type="text"
              className="form-input mt-1 block w-full"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              required
              placeholder="tenant-1"
              disabled={currentUser?.role !== 'SUPERADMIN'}
            />
            {currentUser?.role !== 'SUPERADMIN' && (
              <p className="text-xs text-gray-500 mt-1">
                Usuários do mesmo tenant do usuário logado
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              id="isActive"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Usuário ativo
            </label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
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
              {loading ? 'Salvando...' : user ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm