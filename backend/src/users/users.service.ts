import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para criar usuários');
    }

    // Admin só pode criar usuários no seu próprio tenant
    if (currentUser.role === UserRole.ADMIN && 
        createUserDto.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Só é possível criar usuários no seu próprio tenant');
    }

    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAll(currentUser: any) {
    const where: any = {};

    // Admin e Agent só veem usuários do seu tenant
    if (currentUser.role !== UserRole.SUPERADMIN) {
      where.tenantId = currentUser.tenantId;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const where: any = { id };

    // Admin e Agent só podem ver usuários do seu tenant
    if (currentUser.role !== UserRole.SUPERADMIN) {
      where.tenantId = currentUser.tenantId;
    }

    const user = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    // Verificar se o usuário existe e se o usuário atual tem permissão
    const user = await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para atualizar usuários');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string, currentUser: any) {
    // Verificar se o usuário existe e se o usuário atual tem permissão
    await this.findOne(id, currentUser);

    // Verificar permissões
    if (currentUser.role !== UserRole.SUPERADMIN && 
        currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover usuários');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
