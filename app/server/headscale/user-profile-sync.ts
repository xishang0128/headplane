import { access, constants } from "node:fs/promises";
import { resolve } from "node:path";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-sqlite";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import log from "~/utils/log";

import type { HeadscaleConfig } from "./config-schema";

const headscaleUsers = sqliteTable("users", {
  id: text("id").primaryKey(),
  profilePicUrl: text("profile_pic_url"),
});

export async function syncHeadscaleUserProfilePicture(
  config: HeadscaleConfig | undefined,
  userId: string,
  pictureUrl: string | undefined,
) {
  if (!pictureUrl) {
    return false;
  }

  if (!config || (config.database.type !== "sqlite" && config.database.type !== "sqlite3")) {
    log.debug("auth", "Skipping Headscale profile picture sync: database is not SQLite");
    return false;
  }

  const dbPath = resolve(config.database.sqlite.path);
  try {
    await access(dbPath, constants.R_OK | constants.W_OK);
  } catch (error) {
    log.warn(
      "auth",
      "Skipping Headscale profile picture sync: cannot access %s: %s",
      dbPath,
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }

  try {
    const db = drizzle(dbPath);
    await db
      .update(headscaleUsers)
      .set({ profilePicUrl: pictureUrl })
      .where(eq(headscaleUsers.id, userId));
    return true;
  } catch (error) {
    log.warn(
      "auth",
      "Failed to sync profile picture to Headscale user %s: %s",
      userId,
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}
