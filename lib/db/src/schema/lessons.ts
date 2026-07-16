import { pgTable, serial, integer, real, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  level: text("level").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(""),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  lessonId: integer("lesson_id").references(() => lessonsTable.id).notNull(),
  wpm: real("wpm").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  bestWpm: real("best_wpm").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: text("completed_at"),
  updatedAt: text("updated_at").notNull().default(""),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
