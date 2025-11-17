import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export enum RegisterMode {
  CREATE_TENANT = 'CREATE_TENANT',
  REQUEST_ACCESS = 'REQUEST_ACCESS',
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'Nome do usuário',
    example: 'João Silva'
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'joao@barbearia.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Senha do usuário',
    example: '123456',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'Papel do usuário no sistema (padrão: AGENT)',
    enum: UserRole,
    example: UserRole.AGENT,
    required: false
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ 
    description: 'ID do tenant (obrigatório para ADMIN e AGENT, mas pode ser opcional para registro público)',
    example: 'uuid-do-tenant',
    required: false
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({
    description: 'Modo de registro: criar novo tenant ou pedir acesso a um existente',
    enum: RegisterMode,
    example: RegisterMode.CREATE_TENANT,
    required: false,
    default: RegisterMode.REQUEST_ACCESS,
  })
  @IsOptional()
  @IsEnum(RegisterMode)
  mode?: RegisterMode;

  @ApiProperty({
    description: 'Nome do tenant a ser criado (obrigatório quando mode = CREATE_TENANT)',
    example: 'Minha Barbearia',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantName?: string;

  @ApiProperty({
    description: 'Slug do tenant (para criar ou pedir acesso, ex: minha-barbearia)',
    example: 'minha-barbearia',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
