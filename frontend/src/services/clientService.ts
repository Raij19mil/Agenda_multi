import api from './api'
import { Client, CreateClientRequest, DashboardStats } from '../types'

export const clientService = {
  async getClients(search?: string): Promise<Client[]> {
    const params = search ? { search } : {}
    const response = await api.get('/clients', { params })
    return response.data
  },

  async getClient(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await api.post('/clients', clientData)
    return response.data
  },

  async updateClient(id: string, clientData: Partial<CreateClientRequest>): Promise<Client> {
    const response = await api.patch(`/clients/${id}`, clientData)
    return response.data
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`)
  },

  async getClientStats(id: string): Promise<DashboardStats> {
    const response = await api.get(`/clients/${id}/stats`)
    return response.data
  },
}
