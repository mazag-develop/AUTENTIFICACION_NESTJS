import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private rolesService: RolesService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email, roles: user.roles.map(r => r.name) };

    const accessToken = this.jwtService.sign(payload, { secret: 'supersecret', expiresIn: '15m' });

    const refreshToken = this.jwtService.sign(payload, { secret: 'supersecret_refresh', expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async loginWithGoogle(googleProfile: any) {
    let user = await this.usersService.findByGoogleId(googleProfile.id);

    if (!user) {
      const role = await this.rolesService.findRoleByName('prueba');
      if (!role) throw new Error('Rol "prueba" no encontrado');

      user = await this.usersService.create({
        email: googleProfile.emails[0].value,
        googleId: googleProfile.id,
        roles: [role.id],
        password: Math.random().toString(36).slice(-8),
      });
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles.map(r => r.name) };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: 'supersecret_refresh' });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, roles: user.roles },
        { secret: 'supersecret', expiresIn: '15m' },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

}
