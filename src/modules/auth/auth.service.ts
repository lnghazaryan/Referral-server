import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import type { SessionUser, UserRole } from "./auth.types";
import { SessionService } from "./session.service";

const scrypt = promisify(nodeScrypt);

@Injectable()
export class AuthService {
  constructor(private readonly sessionService: SessionService) {}

  async signUp(username: string, password: string) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      throw new ConflictException("Username already exists.");
    }

    const passwordHash = await this.hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        role: "Guest"
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role
      });

    return created;
  }

  async login(username: string, password: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException("Invalid username or password.");
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid username or password.");
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      role: user.role as UserRole
    };
    const token = this.sessionService.createSession(sessionUser);

    return { token, user: sessionUser };
  }

  async listUsers() {
    return db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users);
  }

  async updateUserRole(userId: number, role: UserRole) {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt
      });

    if (!updated) {
      throw new NotFoundException("User not found.");
    }

    this.sessionService.updateUserRole(userId, updated.role as UserRole);

    return updated;
  }

  async createUser(username: string, password: string, role: UserRole = "Guest") {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      throw new ConflictException("Username already exists.");
    }

    const passwordHash = await this.hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        role
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt
      });

    return created;
  }

  async deleteUser(userId: number, currentUserId: number) {
    if (userId === currentUserId) {
      throw new BadRequestException("You cannot delete your own account.");
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt
      });

    if (!deleted) {
      throw new NotFoundException("User not found.");
    }

    this.sessionService.revokeUserSessions(userId);

    return deleted;
  }

  getSessionUserByToken(token: string | undefined) {
    return this.sessionService.getSessionUserByToken(token);
  }

  revokeSession(token: string | undefined) {
    this.sessionService.revokeSession(token);
  }

  parseSessionTokenFromCookie(cookieHeader: string | undefined) {
    return this.sessionService.parseSessionTokenFromCookie(cookieHeader);
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
  }

  private async verifyPassword(password: string, stored: string) {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) {
      return false;
    }

    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hashHex, "hex");
    if (derived.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(derived, expected);
  }
}
