import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryFirebase } from '../../../infrastructure/repositories/user/user.repository';
import { getAuthCookie } from '../../../utils/auth/get-auth-cookie';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector,
    private jwtService:JwtService,
    private userRepository:UserRepositoryFirebase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = getAuthCookie(request);
    const decoded = await this.jwtService.verify(token);
    const user = await this.userRepository.findUser({ id: decoded.id });
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}
