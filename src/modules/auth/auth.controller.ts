import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";
import type { SessionUser } from "./auth.types";

@ApiExcludeController()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    await this.authService.signUp(dto.username, dto.password);
    const { token, user } = await this.authService.login(dto.username, dto.password);
    this.writeSessionCookie(res, token);
    return { user };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto.username, dto.password);
    this.writeSessionCookie(res, token);
    return { user };
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = this.authService.parseSessionTokenFromCookie(req.headers.cookie);
    this.authService.revokeSession(token);
    res.clearCookie("admin_session");
    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@Req() req: Request & { user?: SessionUser }) {
    return { user: req.user };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Admin")
  @Get("users")
  listUsers() {
    return this.authService.listUsers();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Admin")
  @Post("users")
  createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(
      dto.username,
      dto.password,
      dto.role ?? "Guest"
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Admin")
  @Patch("users/:userId/role")
  updateRole(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto
  ) {
    return this.authService.updateUserRole(userId, dto.role);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("Admin")
  @Delete("users/:userId")
  deleteUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Req() req: Request & { user?: SessionUser }
  ) {
    return this.authService.deleteUser(userId, req.user!.id);
  }

  private writeSessionCookie(res: Response, token: string) {
    res.cookie("admin_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
  }
}
