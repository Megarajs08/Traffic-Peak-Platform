import { pgTable, serial, text, integer, boolean, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const hrAssessmentsTable = pgTable("hr_assessments", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 32 }).notNull().unique(),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  jobPosition: text("job_position").notNull(),
  description: text("description"),
  durationSeconds: integer("duration_seconds").notNull().default(300),
  difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  language: varchar("language", { length: 20 }).notNull().default("english"),
  contentType: varchar("content_type", { length: 30 }).notNull().default("words"),
  customText: text("custom_text"),
  passingWpm: integer("passing_wpm").notNull().default(40),
  minAccuracy: real("min_accuracy").notNull().default(90),
  maxAttempts: integer("max_attempts").notNull().default(1),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const assessmentCandidatesTable = pgTable("assessment_candidates", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().references(() => hrAssessmentsTable.id),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  fingerprint: text("fingerprint"),
  tabSwitches: integer("tab_switches").notNull().default(0),
  attemptNumber: integer("attempt_number").notNull().default(1),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assessmentResultsTable = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => assessmentCandidatesTable.id),
  assessmentId: integer("assessment_id").notNull().references(() => hrAssessmentsTable.id),
  wpm: real("wpm").notNull(),
  cpm: real("cpm").notNull(),
  accuracy: real("accuracy").notNull(),
  errorCount: integer("error_count").notNull(),
  charCount: integer("char_count").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  passed: boolean("passed").notNull(),
  rank: integer("rank"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHrAssessmentSchema = createInsertSchema(hrAssessmentsTable).omit({
  id: true, token: true, createdAt: true, updatedAt: true,
});
export type InsertHrAssessment = z.infer<typeof insertHrAssessmentSchema>;
export type HrAssessment = typeof hrAssessmentsTable.$inferSelect;

export const insertAssessmentCandidateSchema = createInsertSchema(assessmentCandidatesTable).omit({
  id: true, createdAt: true,
});
export type InsertAssessmentCandidate = z.infer<typeof insertAssessmentCandidateSchema>;
export type AssessmentCandidate = typeof assessmentCandidatesTable.$inferSelect;

export const insertAssessmentResultSchema = createInsertSchema(assessmentResultsTable).omit({
  id: true, createdAt: true,
});
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type AssessmentResult = typeof assessmentResultsTable.$inferSelect;
