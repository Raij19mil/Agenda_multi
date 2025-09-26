import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, currentUser: any) {
    // Apenas superadmin pode criar tenants
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Apenas superadmin pode criar tenants');
    }

    // Verificar se o slug já existe
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new BadRequestException('Slug já está em uso');
    }

    const tenant = await this.prisma.tenant.create({
      data: createTenantDto,
    });

    // Criar schema específico para o tenant
    await this.createTenantSchema(tenant.id);

    return tenant;
  }

  async findAll(currentUser: any) {
    // Apenas superadmin pode ver todos os tenants
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Apenas superadmin pode listar todos os tenants');
    }

    return this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            appointments: true,
          },
        },
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const where: any = { id };

    // Admin e Agent só podem ver seu próprio tenant
    if (currentUser.role !== UserRole.SUPERADMIN) {
      where.id = currentUser.tenantId;
    }

    const tenant = await this.prisma.tenant.findFirst({
      where,
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            appointments: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, currentUser: any) {
    // Verificar se o tenant existe e se o usuário atual tem permissão
    const tenant = await this.findOne(id, currentUser);

    // Apenas superadmin pode atualizar tenants
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Apenas superadmin pode atualizar tenants');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string, currentUser: any) {
    // Verificar se o tenant existe e se o usuário atual tem permissão
    await this.findOne(id, currentUser);

    // Apenas superadmin pode remover tenants
    if (currentUser.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Apenas superadmin pode remover tenants');
    }

    // Remover schema específico do tenant
    await this.dropTenantSchema(id);

    return this.prisma.tenant.delete({
      where: { id },
    });
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

  private async dropTenantSchema(tenantId: string) {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    await this.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }
}
