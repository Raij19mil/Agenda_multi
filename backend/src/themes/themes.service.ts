import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  // Temas pré-definidos
  private readonly predefinedThemes = {
    barbearia: {
      name: 'Barbearia',
      colors: {
        primary: '#2D5016',      // Verde escuro
        secondary: '#4A7C59',    // Verde médio
        accent: '#8FBC8F',       // Verde claro
        background: '#F5F5F5',   // Cinza claro
        surface: '#FFFFFF',      // Branco
        text: '#2D5016',         // Verde escuro
        textSecondary: '#666666', // Cinza
        success: '#28A745',      // Verde sucesso
        warning: '#FFC107',      // Amarelo
        error: '#DC3545',        // Vermelho
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Roboto, sans-serif',
      },
    },
    salao: {
      name: 'Salão de Beleza',
      colors: {
        primary: '#E91E63',      // Rosa
        secondary: '#F8BBD9',    // Rosa claro
        accent: '#FCE4EC',       // Rosa muito claro
        background: '#FDF2F8',   // Rosa bem claro
        surface: '#FFFFFF',      // Branco
        text: '#E91E63',         // Rosa
        textSecondary: '#666666', // Cinza
        success: '#28A745',      // Verde sucesso
        warning: '#FFC107',      // Amarelo
        error: '#DC3545',        // Vermelho
      },
      fonts: {
        primary: 'Poppins, sans-serif',
        secondary: 'Open Sans, sans-serif',
      },
    },
    clinica: {
      name: 'Clínica',
      colors: {
        primary: '#FFFFFF',      // Branco
        secondary: '#F8F9FA',    // Cinza muito claro
        accent: '#E3F2FD',       // Azul muito claro
        background: '#FFFFFF',   // Branco
        surface: '#F8F9FA',      // Cinza muito claro
        text: '#212529',         // Preto
        textSecondary: '#6C757D', // Cinza
        success: '#28A745',      // Verde sucesso
        warning: '#FFC107',      // Amarelo
        error: '#DC3545',        // Vermelho
      },
      fonts: {
        primary: 'Roboto, sans-serif',
        secondary: 'Lato, sans-serif',
      },
    },
    default: {
      name: 'Padrão',
      colors: {
        primary: '#3B82F6',      // Azul
        secondary: '#6B7280',    // Cinza
        accent: '#E5E7EB',       // Cinza claro
        background: '#F9FAFB',   // Cinza muito claro
        surface: '#FFFFFF',      // Branco
        text: '#111827',         // Preto
        textSecondary: '#6B7280', // Cinza
        success: '#10B981',      // Verde
        warning: '#F59E0B',      // Amarelo
        error: '#EF4444',        // Vermelho
      },
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'System UI, sans-serif',
      },
    },
  };

  async getThemeByTenantId(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { theme: true, settings: true },
    });

    if (!tenant) {
      return this.predefinedThemes.default;
    }

    const themeName = tenant.theme || 'default';
    const theme = this.predefinedThemes[themeName] || this.predefinedThemes.default;

    // Mesclar com configurações personalizadas do tenant
    if (tenant.settings && tenant.settings.theme) {
      return {
        ...theme,
        ...tenant.settings.theme,
      };
    }

    return theme;
  }

  async getAvailableThemes() {
    return Object.keys(this.predefinedThemes).map(key => ({
      key,
      ...this.predefinedThemes[key],
    }));
  }

  async updateTenantTheme(tenantId: string, themeName: string, customSettings?: any) {
    const updateData: any = { theme: themeName };
    
    if (customSettings) {
      updateData.settings = {
        theme: customSettings,
      };
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return this.getThemeByTenantId(tenantId);
  }

  generateCSSVariables(theme: any) {
    const cssVars = [];
    
    // Cores
    Object.entries(theme.colors).forEach(([key, value]) => {
      cssVars.push(`--color-${key}: ${value};`);
    });

    // Fontes
    Object.entries(theme.fonts).forEach(([key, value]) => {
      cssVars.push(`--font-${key}: ${value};`);
    });

    return cssVars.join('\n');
  }
}
