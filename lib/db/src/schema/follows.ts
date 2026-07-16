import { pgTable, serial, integer, text, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const followsTable = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
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
