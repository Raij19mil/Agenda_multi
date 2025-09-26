import { IsString, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ 
    description: 'Título do agendamento',
    example: 'Corte de cabelo'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Descrição do agendamento',
    example: 'Corte masculino com barba',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Data e hora de início (ISO string)',
    example: '2024-01-15T10:00:00.000Z'
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({ 
    description: 'Data e hora de fim (ISO string)',
    example: '2024-01-15T11:00:00.000Z'
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({ 
    description: 'Status do agendamento',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
    required: false
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ 
    description: 'Observações do agendamento',
    example: 'Cliente prefere corte mais curto',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'ID do cliente',
    example: 'uuid-do-cliente'
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({ 
    description: 'ID do usuário responsável (opcional, usa o usuário logado se não informado)',
    example: 'uuid-do-usuario',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
