import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Application } from 'src/applications/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission, Application])],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
