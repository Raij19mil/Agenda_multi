import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme } from '../types'
import { themeService } from '../services/themeService'

interface ThemeContextType {
  theme: Theme | null
  loading: boolean
  loadTheme: (tenantId: string) => Promise<void>
  updateTheme: (themeName: string, customSettings?: any) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(false)

  const loadTheme = async (tenantId: string) => {
    try {
      setLoading(true)
      const themeData = await themeService.getThemeByTenantId(tenantId)
      setTheme(themeData)
      applyTheme(themeData)
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
      // Aplicar tema padrão em caso de erro
      const defaultTheme = {
        name: 'Padrão',
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#E5E7EB',
          background: '#F9FAFB',
          surface: '#FFFFFF',
          text: '#111827',
          textSecondary: '#6B7280',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        fonts: {
          primary: 'Inter, sans-serif',
          secondary: 'System UI, sans-serif',
        },
      }
      setTheme(defaultTheme)
      applyTheme(defaultTheme)
    } finally {
      setLoading(false)
    }
  }

  const updateTheme = async (themeName: string, customSettings?: any) => {
    try {
      setLoading(true)
      const themeData = await themeService.updateTheme(themeName, customSettings)
      setTheme(themeData)
      applyTheme(themeData)
    } catch (error) {
      console.error('Erro ao atualizar tema:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (themeData: Theme) => {
    const root = document.documentElement
    
    // Aplicar cores
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Aplicar fontes
    Object.entries(themeData.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value)
    })

    // Aplicar fonte principal ao body
    document.body.style.fontFamily = themeData.fonts.primary
  }

  const value = {
    theme,
    loading,
    loadTheme,
    updateTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
