import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agenda-multi.onrender.com'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('Token não encontrado no localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro 401: Não autorizado. Token inválido ou expirado.')
      
      // Limpar token inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirecionar para login se não estiver na página de login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
        alert('Sessão expirada. Por favor, faça login novamente.')
        // Recarregar a página para forçar o componente de login
        window.location.reload()
      }
    }
    
    // Log detalhado para debug
    if (error.response) {
      console.error('Erro na API:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('Erro de rede: Sem resposta do servidor', {
        url: error.config?.url,
        baseURL: error.config?.baseURL
      })
      
      // Não remover token em caso de erro de rede
      // Pode ser problema temporário de conexão
    } else {
      console.error('Erro ao configurar requisição:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api