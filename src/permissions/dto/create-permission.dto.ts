import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users:create', description: 'Nombre único del permiso' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Permiso para crear usuarios', description: 'Descripción del permiso', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
