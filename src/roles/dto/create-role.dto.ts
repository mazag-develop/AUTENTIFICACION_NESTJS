import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'admin',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Rol con todos los permisos',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lista de permisos asociados al rol (UUIDs)',
    type: [String],
    example: ['uuid-permission-1', 'uuid-permission-2'],
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  permissions?: string[];
}
