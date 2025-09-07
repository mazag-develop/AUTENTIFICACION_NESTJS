import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'ERP', description: 'Nombre único de la aplicación' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Sistema de planificación empresarial',
    description: 'Descripción de la aplicación',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
