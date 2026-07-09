import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./roles.guard";
import { SessionService } from "./session.service";
import { UsersBootstrapService } from "./users-bootstrap.service";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    SessionService,
    AuthService,
    AuthGuard,
    RolesGuard,
    UsersBootstrapService
  ],
  exports: [SessionService, AuthService, AuthGuard, RolesGuard]
})
export class AuthModule {}
