import api from './api'
import { Theme } from '../types'

export const themeService = {
  async getAvailableThemes(): Promise<Array<{ key: string } & Theme>> {
    const response = await api.get('/themes/available')
    return response.data
  },

  async getThemeByTenantId(tenantId: string): Promise<Theme> {
    const response = await api.get(`/themes/tenant/${tenantId}`)
    return response.data
  },

  async gettenantIdTheme(): Promise<Theme> {
    const response = await api.get('/themes/${tenantId}')
    return response.data
  },

  async updateTheme(tenantId: string, themeName: string, customSettings?: any): Promise<Theme> {
    const response = await api.post(`/themes/tenant/${tenantId}`, {
      themeName,
      customSettings,
    });
    return response.data;
  },

  async getThemeCSS(tenantId: string): Promise<{ css: string; theme: Theme }> {
    const response = await api.get(`/themes/css/${tenantId}`);
    return response.data;
  },
};
