import { IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ 
    description: 'Nome do cliente',
    example: 'João Silva'
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ 
    description: 'Número de telefone do cliente',
    example: '(11) 99999-9999'
  })
  @IsString()
  phone: string;

  @ApiProperty({ 
    description: 'Email do cliente',
    example: 'joao@email.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ 
    description: 'Observações sobre o cliente',
    example: 'Cliente prefere horário da manhã',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Status ativo do cliente',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
