import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'admin123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Lista de roles asignados al usuario (UUIDs)',
    type: [String],
    example: ['uuid-role-1', 'uuid-role-2'],
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  roles?: string[];

  @ApiPropertyOptional({ description: 'Google ID del usuario' })
  @IsOptional()
  @IsString()
  googleId?: string

}
