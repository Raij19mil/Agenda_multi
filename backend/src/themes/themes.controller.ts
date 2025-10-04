import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Temas')
@Controller('themes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('available')
  @ApiOperation({ summary: 'Listar temas disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de temas obtida com sucesso' })
  getAvailableThemes() {
    return this.themesService.getAvailableThemes();
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Obter tema do tenant' })
  @ApiResponse({ status: 200, description: 'Tema obtido com sucesso' })
  getThemeByTenantId(@Param('tenantId') tenantId: string) {
    return this.themesService.getThemeByTenantId(tenantId);
  }

  @Get('tenantId')
  @ApiOperation({ summary: 'Obter tema do tenant atual' })
  @ApiResponse({ status: 200, description: 'Tema obtido com sucesso' })
  gettenantIdTheme(@Request() req) {
    return this.themesService.getThemeByTenantId(req.user.tenantId);
  }

  @Post('tenant/:tenantId')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar tema do tenant' })
  @ApiResponse({ status: 200, description: 'Tema atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar tema' })
  updateTenantTheme(
    @Param('tenantId') tenantId: string,
    @Body() updateThemeDto: UpdateThemeDto,
    @Request() req,
  ) {
    // Admin só pode atualizar o tema do seu próprio tenant
    if (req.user.role === UserRole.ADMIN && req.user.tenantId !== tenantId) {
      throw new ForbiddenException('Só é possível atualizar o tema do seu próprio tenant');
    }

    return this.themesService.updateTenantTheme(
      tenantId,
      updateThemeDto.themeName,
      updateThemeDto.customSettings,
    );
  }

  @Get('css/:tenantId')
  @ApiOperation({ summary: 'Obter CSS do tema do tenant' })
  @ApiResponse({ status: 200, description: 'CSS obtido com sucesso' })
  async getThemeCSS(@Param('tenantId') tenantId: string) {
    const theme = await this.themesService.getThemeByTenantId(tenantId);
    const css = this.themesService.generateCSSVariables(theme);
    
    return {
      css: `:root {\n${css}\n}`,
      theme,
    };
  }
}
