import React, { useState, useEffect } from 'react'

interface UserType {
  id?: string
  name: string
  email: string
  role: string
  isActive: boolean
  password?: string
}

interface UserFormProps {
  user: UserType | null
  onClose: () => void
  onSave: (data: Omit<UserType, 'id'>) => void
  loading?: boolean
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, loading }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [isActive, setIsActive] = useState(true)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setRole(user.role || 'ADMIN')
      setIsActive(user.isActive)
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setRole('ADMIN')
      setIsActive(true)
      setPassword('')
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = { name, email, role, isActive }
    if (!user) data.password = password
    onSave(data)
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
        <h2 className="text-xl font-bold mb-4">{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              className="form-input w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              className="form-input w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha *</label>
              <input
                type="password"
                className="form-input w-full"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Função *</label>
            <select
              className="form-input w-full"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN">Administrador</option>
              <option value="AGENT">Agente</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="form-checkbox"
              id="isActive"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Ativo</label>
          </div>
          <div className="flex justify-end space-x-2">
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
              {user ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
