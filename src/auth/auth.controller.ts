import { Controller, Post, Body, Res, UseGuards, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Roles } from './decorators';
import { RolesGuard, JwtRefreshGuard, JwtAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(body.email, body.password);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ message: 'Login exitoso' });
  }

  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth('refresh_token')
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) { 
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No hay refresh token');
    }

    const { accessToken } = await this.authService.refresh(refreshToken);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: 'Access token renovado' });
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @Get('profile')
  async profile(@Req() req: Request) {
    return req['user'];
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return res.json({ message: 'Sesión cerrada' });
  }
}
