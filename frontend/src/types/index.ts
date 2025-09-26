export interface User {
  id: string
  email: string
  name: string
  role: 'SUPERADMIN' | 'ADMIN' | 'AGENT'
  tenantId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  theme: string
  settings?: any
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    clients: number
    appointments: number
  }
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  appointments?: Appointment[]
}

export interface Appointment {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  createdAt: string
  updatedAt: string
  client: Client
  user: User
}

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    success: string
    warning: string
    error: string
  }
  fonts: {
    primary: string
    secondary: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface CreateClientRequest {
  name: string
  phone: string
  email?: string
  notes?: string
  isActive?: boolean
}

export interface CreateAppointmentRequest {
  title: string
  description?: string
  startTime: string
  endTime: string
  status?: string
  notes?: string
  clientId: string
  userId?: string
}

export interface DashboardStats {
  totalAppointments: number
  statusCounts: Record<string, number>
  dailyStats: Array<{
    date: string
    count: number
  }>
}

export interface ActivityLog {
  id: string
  action: string
  entity: string
  entityId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}
