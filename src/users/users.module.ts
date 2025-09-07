import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PermissionsGuard, RolesGuard } from 'src/auth/guards';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UsersService, RolesGuard, PermissionsGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
