import api from './api'
import { Appointment, CreateAppointmentRequest, DashboardStats } from '../types'

export const appointmentService = {
  async getAppointments(filters?: any): Promise<Appointment[]> {
    const response = await api.get('/appointments', { params: filters })
    return response.data
  },

  async getAppointment(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  },

  async updateAppointment(id: string, appointmentData: Partial<CreateAppointmentRequest>): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}`, appointmentData)
    return response.data
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  },

  async getCalendarData(month: number, year: number): Promise<Appointment[]> {
    const response = await api.get(`/appointments/calendar/${month}/${year}`)
    return response.data
  },

  async getDashboardStats(month?: number, year?: number): Promise<DashboardStats> {
    const params = month && year ? { month, year } : {}
    const response = await api.get('/appointments/dashboard', { params })
    return response.data
  },
}
