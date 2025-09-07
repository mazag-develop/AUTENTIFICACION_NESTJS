import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true; // si no hay permisos requeridos, acceso libre
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user?.roles) {
      throw new ForbiddenException('Usuario sin roles asignados');
    }

    const userPermissions = user.roles.flatMap((role) =>
      (role.permissions ?? []).map((p) => p.name),
    );

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    return true;
  }
}
