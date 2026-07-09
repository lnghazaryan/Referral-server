import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { SessionService } from "./session.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{
      headers: { cookie?: string };
      user?: unknown;
    }>();
    const token = this.sessionService.parseSessionTokenFromCookie(
      request.headers.cookie
    );
    const user = this.sessionService.getSessionUserByToken(token);
    if (!user) {
      throw new UnauthorizedException("Please login.");
    }

    request.user = user;
    return true;
  }
}
