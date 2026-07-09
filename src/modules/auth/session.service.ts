import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type { SessionUser } from "./auth.types";

@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, SessionUser>();

  createSession(user: SessionUser) {
    const token = randomBytes(24).toString("hex");
    this.sessions.set(token, user);
    return token;
  }

  getSessionUserByToken(token: string | undefined) {
    if (!token) {
      return null;
    }
    return this.sessions.get(token) ?? null;
  }

  revokeSession(token: string | undefined) {
    if (!token) {
      return;
    }
    this.sessions.delete(token);
  }

  updateUserRole(userId: number, role: SessionUser["role"]) {
    for (const [token, sessionUser] of this.sessions.entries()) {
      if (sessionUser.id === userId) {
        this.sessions.set(token, { ...sessionUser, role });
      }
    }
  }

  revokeUserSessions(userId: number) {
    for (const [token, sessionUser] of this.sessions.entries()) {
      if (sessionUser.id === userId) {
        this.sessions.delete(token);
      }
    }
  }

  parseSessionTokenFromCookie(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(";").map(part => part.trim());
    for (const part of cookies) {
      if (part.startsWith("admin_session=")) {
        return decodeURIComponent(part.slice("admin_session=".length));
      }
    }
    return undefined;
  }
}
