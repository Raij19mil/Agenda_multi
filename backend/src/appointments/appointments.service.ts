import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UserRole, AppointmentStatus } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, currentUser: any) {
    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN && 
        currentUser.role !== UserRole.AGENT) {
      throw new ForbiddenException('Sem permissão para criar agendamentos');
    }

    // Verificar se o cliente pertence ao tenant
    const client = await this.prisma.client.findFirst({
      where: {
        id: createAppointmentDto.clientId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verificar conflitos de horário
    await this.checkTimeConflict(
      createAppointmentDto.startTime,
      createAppointmentDto.endTime,
      currentUser.tenantId,
      createAppointmentDto.userId || currentUser.id,
    );

    return this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        tenantId: currentUser.tenantId,
        userId: createAppointmentDto.userId || currentUser.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(currentUser: any, filters: any = {}) {
    const where: any = {
      tenantId: currentUser.tenantId,
    };

    // Filtros de data
    if (filters.startDate) {
      where.startTime = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.endTime = {
        lte: new Date(filters.endDate),
      };
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por cliente
    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    // Filtro por usuário
    if (filters.userId) {
      where.userId = filters.userId;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        tenantId: currentUser.tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, currentUser: any) {
    // Verificar se o agendamento existe e pertence ao tenant do usuário
    await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN && 
        currentUser.role !== UserRole.AGENT) {
      throw new ForbiddenException('Sem permissão para atualizar agendamentos');
    }

    // Verificar conflitos de horário se estiver alterando o horário
    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      const startTime = updateAppointmentDto.startTime || appointment.startTime;
      const endTime = updateAppointmentDto.endTime || appointment.endTime;

      await this.checkTimeConflict(
        startTime,
        endTime,
        currentUser.tenantId,
        appointment.userId,
        id,
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, currentUser: any) {
    // Verificar se o agendamento existe e pertence ao tenant do usuário
    await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover agendamentos');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async getCalendarData(currentUser: any, month: number, year: number) {
    const startDate = moment({ year, month: month - 1, day: 1 }).startOf('month').toDate();
    const endDate = moment({ year, month: month - 1, day: 1 }).endOf('month').toDate();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId: currentUser.tenantId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return appointments;
  }

  async getDashboardStats(currentUser: any, month?: number, year?: number) {
    const now = moment();
    const startDate = month && year 
      ? moment({ year, month: month - 1, day: 1 }).startOf('month').toDate()
      : now.clone().startOf('month').toDate();
    const endDate = month && year
      ? moment({ year, month: month - 1, day: 1 }).endOf('month').toDate()
      : now.clone().endOf('month').toDate();

    const stats = await this.prisma.appointment.aggregate({
      where: {
        tenantId: currentUser.tenantId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const statusCounts = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: {
        tenantId: currentUser.tenantId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const dailyStats = await this.prisma.appointment.groupBy({
      by: ['startTime'],
      where: {
        tenantId: currentUser.tenantId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
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
      dailyStats: dailyStats.map(item => ({
        date: item.startTime,
        count: item._count.id,
      })),
    };
  }

  private async checkTimeConflict(
    startTime: Date,
    endTime: Date,
    tenantId: string,
    userId: string,
    excludeId?: string,
  ) {
    const where: any = {
      tenantId,
      userId,
      OR: [
        {
          startTime: {
            lt: endTime,
            gte: startTime,
          },
        },
        {
          endTime: {
            gt: startTime,
            lte: endTime,
          },
        },
        {
          startTime: {
            lte: startTime,
          },
          endTime: {
            gte: endTime,
          },
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const conflict = await this.prisma.appointment.findFirst({
      where,
    });

    if (conflict) {
      throw new BadRequestException('Já existe um agendamento neste horário');
    }
  }
}
