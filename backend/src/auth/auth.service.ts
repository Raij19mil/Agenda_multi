import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { RegisterDto, RegisterMode } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // Verificar se o usuário existe e está ativo
    if (!user || !user.isActive) {
      return null;
    }
    
    // Verificar senha
    if (await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tenantId: user.tenantId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    const mode = registerDto.mode || RegisterMode.REQUEST_ACCESS;

    let tenantId = registerDto.tenantId;
    let role: UserRole = UserRole.AGENT;
    let isActive = true;

    if (mode === RegisterMode.CREATE_TENANT) {
      // Criar um novo tenant e associar o usuário como ADMIN
      if (!registerDto.tenantName || !registerDto.tenantSlug) {
        throw new BadRequestException(
          'Nome e slug do tenant são obrigatórios para criar um novo espaço.',
        );
      }

      const existingTenantBySlug = await this.prisma.tenant.findUnique({
        where: { slug: registerDto.tenantSlug },
      });

      if (existingTenantBySlug) {
        throw new BadRequestException('Já existe um espaço com esse endereço (slug).');
      }

      const tenant = await this.prisma.tenant.create({
        data: {
          name: registerDto.tenantName,
          slug: registerDto.tenantSlug,
          isActive: true,
        },
      });

      await this.createTenantSchema(tenant.id);

      tenantId = tenant.id;
      role = UserRole.ADMIN;
      isActive = true;
    } else {
      // REQUEST_ACCESS: usuário pede acesso a um tenant existente
      // Sempre força role AGENT e deixa usuário inativo até aprovação
      role = UserRole.AGENT;
      isActive = false;

      // Localiza tenant por slug (preferencial) ou por id
      let tenant = null;

      if (registerDto.tenantSlug) {
        tenant = await this.prisma.tenant.findUnique({
          where: { slug: registerDto.tenantSlug },
        });
      } else if (tenantId) {
        tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
        });
      }

      if (!tenant) {
        throw new BadRequestException('Tenant não encontrado para o pedido de acesso.');
      }

      if (!tenant.isActive) {
        throw new BadRequestException('Tenant não está ativo.');
      }

      tenantId = tenant.id;
    }

    if (!tenantId) {
      throw new BadRequestException('Nenhum tenant válido foi definido.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role,
        tenantId,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  private async createTenantSchema(tenantId: string) {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    // Criar schema específico para o tenant
    await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Criar tabelas no schema do tenant
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'SCHEDULED',
        notes TEXT,
        client_id UUID NOT NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    return user;
  }

  async refreshToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tenantId: user.tenantId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
