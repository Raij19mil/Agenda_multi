import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, LoginRequest } from '../types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (token) {
          if (storedUser) {
            // Tentar usar o usuário do localStorage primeiro
            try {
              const parsedUser = JSON.parse(storedUser)
              setUser(parsedUser)
            } catch (e) {
              console.error('Erro ao parsear usuário do localStorage:', e)
            }
          }
          
          // Buscar dados atualizados do backend
          try {
            const userData = await authService.getProfile()
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } catch (error) {
            console.error('Erro ao carregar perfil:', error)
            // Se falhar, manter o usuário do localStorage se existir
            if (!storedUser) {
              localStorage.removeItem('token')
              setUser(null)
            }
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      
      // Salvar token
      localStorage.setItem('token', response.access_token)
      
      // Buscar dados do usuário após login
      try {
        const userData = await authService.getProfile()
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        console.log('Login bem-sucedido. Usuário:', userData)
      } catch (profileError) {
        console.error('Erro ao buscar perfil após login:', profileError)
        // Se falhar ao buscar perfil, fazer logout
        localStorage.removeItem('token')
        throw new Error('Erro ao carregar dados do usuário')
      }
      
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast.error(error.response?.data?.message || 'Erro ao fazer login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      localStorage.setItem('token', response.access_token)
      
      // Buscar dados atualizados do usuário após renovar o token
      try {
        const userData = await authService.getProfile()
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch (profileError) {
        console.error('Erro ao atualizar perfil após refresh:', profileError)
        // Manter o usuário atual se falhar
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      logout()
    }
  }

  const switchTenant = async (newTenantId: string) => {
    try {
      if (!user) {
        throw new Error('Usuário não está logado')
      }

      // Verificar se é SUPERADMIN
      if (user.role !== 'SUPERADMIN') {
        throw new Error('Apenas SUPERADMIN pode trocar de tenant')
      }

      // Atualizar o tenantId do usuário localmente
      const updatedUser = { ...user, tenantId: newTenantId }
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Atualizar o estado
      setUser(updatedUser)
      
      console.log('Tenant alterado para:', newTenantId)
      
    } catch (error: any) {
      console.error('Erro ao trocar tenant:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
    switchTenant,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}