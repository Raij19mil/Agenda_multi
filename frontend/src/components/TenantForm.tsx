import React, { useState, useEffect } from 'react'

interface TenantType {
  id?: string
  name: string
  slug: string
  theme: string
  isActive: boolean
}

interface TenantFormProps {
  tenant: TenantType | null
  onClose: () => void
  onSave: (data: Omit<TenantType, 'id'>) => void
  loading?: boolean
}

const TenantForm: React.FC<TenantFormProps> = ({ tenant, onClose, onSave, loading }) => {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState('barbearia')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '')
      setSlug(tenant.slug || '')
      setTheme(tenant.theme || 'barbearia')
      setIsActive(tenant.isActive)
    } else {
      setName('')
      setSlug('')
      setTheme('barbearia')
      setIsActive(true)
    }
  }, [tenant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, slug, theme, isActive })
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
        <h2 className="text-xl font-bold mb-4">{tenant ? 'Editar Tenant' : 'Novo Tenant'}</h2>
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
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              type="text"
              className="form-input w-full"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tema *</label>
            <select
              className="form-input w-full"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              required
            >
              <option value="barbearia">Barbearia</option>
              <option value="salao">Salão de Beleza</option>
              <option value="clinica">Clínica</option>
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
              {tenant ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TenantForm
