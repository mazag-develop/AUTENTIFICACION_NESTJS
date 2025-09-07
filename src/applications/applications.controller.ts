import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aplicación' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las aplicaciones' })
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una aplicación por ID' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una aplicación por ID' })
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una aplicación por ID' })
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
