import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const testResultsTable = sqliteTable("test_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => usersTable.id),
  wpm: real("wpm").notNull(),
  cpm: real("cpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  mode: text("mode").notNull().default("words"),
  errorCount: integer("error_count").notNull().default(0),
  charCount: integer("char_count").notNull().default(0),
  language: text("language").default("english"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertTestResultSchema = createInsertSchema(testResultsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResultsTable.$inferSelect;
