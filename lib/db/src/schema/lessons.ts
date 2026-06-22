import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const lessonsTable = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  level: text("level").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(""),
});

export const lessonProgressTable = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => usersTable.id),
  lessonId: integer("lesson_id").references(() => lessonsTable.id).notNull(),
  wpm: real("wpm").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  bestWpm: real("best_wpm").notNull().default(0),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
  updatedAt: text("updated_at").notNull().default(""),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
