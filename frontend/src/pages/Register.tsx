import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  tenantMode: 'REQUEST_ACCESS' | 'CREATE_TENANT'
  tenantName: string
  tenantSlug: string
}

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantMode: 'REQUEST_ACCESS',
    tenantName: '',
    tenantSlug: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.name.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Por favor, informe seu e-mail')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.tenantMode === 'CREATE_TENANT') {
      if (!formData.tenantName.trim()) {
        toast.error('Informe o nome do seu espaço (tenant)')
        return
      }
      if (!formData.tenantSlug.trim()) {
        toast.error('Informe um endereço (slug) para o seu espaço')
        return
      }
    }

    if (formData.tenantMode === 'REQUEST_ACCESS') {
      if (!formData.tenantSlug.trim()) {
        toast.error('Informe o código/endereço do espaço ao qual deseja acesso')
        return
      }
    }

    setLoading(true)
    
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        mode: formData.tenantMode,
      }

      const normalizedSlug = formData.tenantSlug.trim().toLowerCase()

      if (formData.tenantMode === 'CREATE_TENANT') {
        payload.tenantName = formData.tenantName.trim()
        payload.tenantSlug = normalizedSlug
      } else {
        payload.tenantSlug = normalizedSlug
      }

      await authService.register(payload)

      if (formData.tenantMode === 'CREATE_TENANT') {
        toast.success('Conta e espaço criados com sucesso! Faça login para continuar.')
      } else {
        toast.success('Pedido de acesso enviado! Aguarde a aprovação do administrador do espaço.')
      }
      navigate('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text">Criar Conta</h2>
          <p className="mt-2 text-text-secondary">
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input pl-10"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="form-input pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="form-input pl-10 pr-10"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Criar Conta'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-secondary w-full py-3"
              disabled={loading}
            >
              Já tenho uma conta - Fazer Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register

