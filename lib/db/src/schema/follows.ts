import { sqliteTable, integer, text, unique } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const followsTable = sqliteTable(
  "follows",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    followerId: integer("follower_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(""),
  },
  (t) => ({ uniq: unique().on(t.followerId, t.followingId) })
);

export type Follow = typeof followsTable.$inferSelect;
