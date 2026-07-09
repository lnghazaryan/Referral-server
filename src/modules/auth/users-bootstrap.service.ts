import { Injectable, OnModuleInit } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { db } from "../../db/client";
import { users } from "../../db/schema";

const scrypt = promisify(nodeScrypt);

const ADMIN_SEED_USERNAME = "refadmin";
const ADMIN_SEED_PASSWORD = "admin1234";

@Injectable()
export class UsersBootstrapService implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.seedAdminUser();
    } catch (error) {
      console.warn(
        "Admin user seed skipped. Run DB migrations first.",
        error instanceof Error ? error.message : error
      );
    }
  }

  private async seedAdminUser() {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, ADMIN_SEED_USERNAME))
      .limit(1);

    if (existing) {
      if (existing.role !== "Admin") {
        await db
          .update(users)
          .set({ role: "Admin" })
          .where(
            and(eq(users.id, existing.id), eq(users.username, existing.username))
          );
      }
      return;
    }

    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(ADMIN_SEED_PASSWORD, salt, 64)) as Buffer;
    const passwordHash = `${salt}:${derived.toString("hex")}`;

    await db.insert(users).values({
      username: ADMIN_SEED_USERNAME,
      passwordHash,
      role: "Admin"
    });
  }
}
