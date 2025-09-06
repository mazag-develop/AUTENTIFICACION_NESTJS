import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
  ) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const roles = dto.roles?.length
      ? await this.rolesRepo.find({ where: { id: In(dto.roles) } })
      : [];

    const user = this.usersRepo.create({
      ...dto,
      password: hashedPassword,
      roles,
    });

    return this.usersRepo.save(user);
  }

  async findAll() {
    return this.usersRepo.find({ relations: ['roles', 'roles.permissions'] });
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
  
  async findById(id: string) {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByEmail(email: string) {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.password && dto.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.password = hashedPassword;
    }

    if (dto.roles) {
      user.roles = await this.rolesRepo.find({ where: { id: In(dto.roles) } });
    }

    Object.assign(user, dto);

    return this.usersRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.usersRepo.remove(user);
  }
}
