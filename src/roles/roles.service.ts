import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto) {
    const permissions = dto.permissions?.length
      ? await this.permsRepo.find({ where: { id: In(dto.permissions) } })
      : [];

    const role = this.rolesRepo.create({
      ...dto,
      permissions,
    });

    return this.rolesRepo.save(role);
  }

  async findAll() {
    return this.rolesRepo.find({ relations: ['permissions'] });
  }

  async findOne(id: string) {
    const role = await this.rolesRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (dto.permissions) {
      role.permissions = await this.permsRepo.find({ where: { id: In(dto.permissions) } });
    }

    Object.assign(role, dto);

    return this.rolesRepo.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    return this.rolesRepo.remove(role);
  }
}
