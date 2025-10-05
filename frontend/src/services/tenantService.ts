import api from './api'
import { Tenant } from '../types'

export const tenantService = {
  async getTenants(search?: string): Promise<Tenant[]> {
    const params = search ? { search } : {}
    const response = await api.get('/tenants', { params })
    return response.data
  },

  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | '_count'>): Promise<Tenant> {
    const response = await api.post('/tenants', data)
    return response.data
  },

  async updateTenant(id: string, data: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | '_count'>>): Promise<Tenant> {
    const response = await api.patch(`/tenants/${id}`, data)
    return response.data
  },

  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`)
  },
}
