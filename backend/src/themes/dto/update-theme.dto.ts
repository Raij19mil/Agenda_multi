import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateThemeDto {
  @ApiProperty({ 
    description: 'Nome do tema',
    example: 'barbearia',
    enum: ['barbearia', 'salao', 'clinica', 'default']
  })
  @IsString()
  themeName: string;

  @ApiProperty({ 
    description: 'Configurações personalizadas do tema',
    example: { colors: { primary: '#FF0000' } },
    required: false
  })
  @IsOptional()
  @IsObject()
  customSettings?: any;
}
