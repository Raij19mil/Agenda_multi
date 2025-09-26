import { IsString, MinLength, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ 
    description: 'Nome do tenant',
    example: 'Barbearia do João'
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ 
    description: 'Slug único do tenant (usado na URL)',
    example: 'barbearia-joao'
  })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiProperty({ 
    description: 'Tema do tenant',
    example: 'barbearia',
    required: false
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ 
    description: 'Configurações específicas do tenant',
    example: { workingHours: { start: '08:00', end: '18:00' } },
    required: false
  })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiProperty({ 
    description: 'Status ativo do tenant',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
