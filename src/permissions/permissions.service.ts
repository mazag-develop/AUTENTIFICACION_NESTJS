import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto) {
    const perm = this.permsRepo.create(dto);
    return this.permsRepo.save(perm);
  }

  async findAll() {
    return this.permsRepo.find();
  }

  async findOne(id: string) {
    const perm = await this.permsRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permiso no encontrado');
    return perm;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const perm = await this.findOne(id);
    Object.assign(perm, dto);
    return this.permsRepo.save(perm);
  }

  async remove(id: string) {
    const perm = await this.findOne(id);
    return this.permsRepo.remove(perm);
  }
}
