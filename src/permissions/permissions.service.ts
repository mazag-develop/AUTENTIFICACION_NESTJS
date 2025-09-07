import { Controller, Delete, Get, Injectable, NotFoundException, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
  ) {}

  @Post()
  async create(dto: CreatePermissionDto) {
    const perm = this.permsRepo.create(dto);
    return this.permsRepo.save(perm);
  }

   @Get()
  async findAll() {
    return this.permsRepo.find();
  }

  @Get(':id')
  async findOne(id: string) {
    const perm = await this.permsRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permiso no encontrado');
    return perm;
  }

  @Patch(':id')
  @ApiBody({ type: UpdatePermissionDto })
  async update(id: string, dto: UpdatePermissionDto) {
    const perm = await this.findOne(id);
    Object.assign(perm, dto);
    return this.permsRepo.save(perm);
  }

  @Delete(':id')
  async remove(id: string) {
    const perm = await this.findOne(id);
    return this.permsRepo.remove(perm);
  }
}
