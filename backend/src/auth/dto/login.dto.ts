import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email do usuário',
    example: 'admin@barbearia.com'
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
}
