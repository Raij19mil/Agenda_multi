import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

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
    description: 'Papel do usuário no sistema',
    enum: UserRole,
    example: UserRole.AGENT
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    description: 'ID do tenant (obrigatório para ADMIN e AGENT)',
    example: 'uuid-do-tenant',
    required: false
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
