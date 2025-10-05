import api from './api'
import { User } from '../types'

export const userService = {
  async getUsers(search?: string): Promise<User[]> {
    const params = search ? { search } : {}
    const response = await api.get('/users', { params })
    return response.data
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'isActive'> & { password: string }): Promise<User> {
    const response = await api.post('/users', data)
    return response.data
  },

  async updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'tenant'>>): Promise<User> {
    const response = await api.patch(`/users/${id}`, data)
    return response.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
