import { pgTable, serial, integer, real, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const testResultsTable = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  wpm: real("wpm").notNull(),
  cpm: real("cpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  mode: varchar("mode", { length: 50 }).notNull().default("words"),
  errorCount: integer("error_count").notNull().default(0),
  charCount: integer("char_count").notNull().default(0),
  language: varchar("language", { length: 50 }).default("english"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTestResultSchema = createInsertSchema(testResultsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResultsTable.$inferSelect;
