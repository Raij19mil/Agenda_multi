import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, currentUser: any) {
    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN && 
        currentUser.role !== UserRole.AGENT) {
      throw new ForbiddenException('Sem permissão para criar clientes');
    }

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        tenantId: currentUser.tenantId,
      },
      include: {
        appointments: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(currentUser: any, search?: string) {
    const where: any = {
      tenantId: currentUser.tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.client.findMany({
      where,
      include: {
        appointments: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
      include: {
        appointments: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, currentUser: any) {
    // Verificar se o cliente existe e pertence ao tenant do usuário
    await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN && 
        currentUser.role !== UserRole.AGENT) {
      throw new ForbiddenException('Sem permissão para atualizar clientes');
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: {
        appointments: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });
  }

  async remove(id: string, currentUser: any) {
    // Verificar se o cliente existe e pertence ao tenant do usuário
    await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover clientes');
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async getClientStats(clientId: string, currentUser: any) {
    const client = await this.findOne(clientId, currentUser);

    const stats = await this.prisma.appointment.aggregate({
      where: {
        clientId,
        tenantId: currentUser.tenantId,
      },
      _count: {
        id: true,
      },
      _sum: {
  id: true
},
    });

    const statusCounts = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: {
        clientId,
        tenantId: currentUser.tenantId,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalAppointments: stats._count.id,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
    };
  }
}
