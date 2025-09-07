import { Controller, Post, Body, Res, UseGuards, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import {  JwtRefreshGuard, JwtAuthGuard } from './guards';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión con email y contraseña',
    description: 'Valida las credenciales del usuario y genera tokens de acceso y refresco. Devuelve los tokens en cookies seguras.' 
  })
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

  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiOperation({ 
    summary: 'Iniciar sesión con Google',
    description: 'Redirige al usuario a la pantalla de login de Google para autenticación mediante OAuth2.' 
  })
  async googleAuth(@Req() req) {}

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiOperation({ 
    summary: 'Callback de Google OAuth',
    description: 'Procesa la respuesta de Google OAuth2, genera tokens JWT y los guarda en cookies seguras.' 
  })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginWithGoogle(req.user);
    res.cookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ message: 'Login exitoso' });
  }

  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth('refresh_token')
  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refrescar el access token',
    description: 'Renueva el access token usando el refresh token almacenado en cookies.' 
  })
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
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Devuelve la información del usuario actual basada en el access token.' 
  })
  async profile(@Req() req: Request) {
    return req['user'];
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @Post('logout')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Elimina las cookies con access y refresh token, cerrando la sesión del usuario.' 
  })
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
