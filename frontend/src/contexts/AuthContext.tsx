import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginRequest, LoginResponse } from '../types'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
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
        if (token) {
          const userData = await authService.getProfile()
          
          // Validar se os dados do usuário estão completos
          if (userData && userData.id && userData.email && userData.name) {
            setUser(userData)
          } else {
            console.error('Dados do usuário incompletos:', userData)
            localStorage.removeItem('token')
            setUser(null)
            toast.error('Erro ao carregar dados do usuário. Faça login novamente.')
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error)
        localStorage.removeItem('token')
        setUser(null)
        
        // Apenas mostrar erro se não for 401 (não autorizado)
        if (error.response?.status !== 401) {
          toast.error('Erro ao carregar perfil do usuário')
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const response: LoginResponse = await authService.login(credentials)
      
      // Validar resposta do login
      if (!response.access_token) {
        throw new Error('Token não recebido do servidor')
      }
      
      if (!response.user || !response.user.id || !response.user.email || !response.user.name) {
        throw new Error('Dados do usuário incompletos na resposta do servidor')
      }
      
      localStorage.setItem('token', response.access_token)
      setUser(response.user)
      toast.success(`Bem-vindo, ${response.user.name}!`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login'
      toast.error(errorMessage)
      localStorage.removeItem('token')
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      localStorage.setItem('token', response.access_token)
    } catch (error) {
      logout()
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
