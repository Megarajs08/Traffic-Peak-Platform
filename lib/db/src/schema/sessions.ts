import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

export type Session = typeof sessionsTable.$inferSelect;
