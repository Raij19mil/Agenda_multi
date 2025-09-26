import api from './api'
import { LoginRequest, LoginResponse, User } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  async register(userData: any): Promise<User> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
}
