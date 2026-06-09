import { pgTable, serial, text, varchar, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  content: text("content").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  lessonId: integer("lesson_id").references(() => lessonsTable.id).notNull(),
  wpm: real("wpm").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  bestWpm: real("best_wpm").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
