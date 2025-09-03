import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
  ) {}

  async runSeed() {
    const permissions = [
      'users:view',
      'users:create',
      'users:update',
      'users:delete',
      'roles:view',
      'roles:create',
      'roles:update',
      'roles:delete',
      'permissions:view',
      'permissions:create',
      'permissions:update',
      'permissions:delete',
    ];

    const existingPerms = await this.permsRepo.find();
    const newPerms = permissions
      .filter((p) => !existingPerms.some((ep) => ep.name === p))
      .map((p) => this.permsRepo.create({ name: p, description: `Permiso ${p}` }));

    const savedPerms = await this.permsRepo.save(newPerms);

    let adminRole = await this.rolesRepo.findOne({ where: { name: 'admin' }, relations: ['permissions'] });

    if (!adminRole) {
      adminRole = this.rolesRepo.create({
        name: 'admin',
        description: 'Rol con todos los permisos',
        permissions: [...existingPerms, ...savedPerms],
      });
      adminRole = await this.rolesRepo.save(adminRole);
    }

    let adminUser = await this.usersRepo.findOne({ where: { email: 'admin@example.com' }, relations: ['roles'] });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = this.usersRepo.create({
        email: 'admin@example.com',
        password: hashedPassword,
        roles: [adminRole],
        isActive: true,
      });
      adminUser = await this.usersRepo.save(adminUser);
    }

    return {
      message: 'Seed ejecutado correctamente',
      adminUser: { email: adminUser.email, password: 'admin123' },
    };
  }
}
