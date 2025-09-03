import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class UsersSeed implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const adminExists = await this.usersService.findByEmail('admin@example.com');
    if (!adminExists) {
      await this.usersService.create({
        email: 'admin@example.com',
        password: 'admin123',
        roles: [],
      });
      console.log('✅ Usuario admin creado');
    }
  }
}
