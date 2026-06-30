import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const passwordResetTokensTable = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull().default(""),
});

export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
