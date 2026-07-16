import { pgTable, serial, integer, real, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { testResultsTable } from "./test_results";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: text("certificate_id").notNull().unique(),
  userId: integer("user_id").references(() => usersTable.id),
  testResultId: integer("test_result_id").references(() => testResultsTable.id),
  recipientName: text("recipient_name").notNull(),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(), // in seconds
  mode: text("mode").notNull(),
  level: text("level").default("Intermediate"), // difficulty level
  issuedAt: text("issued_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable)
  .omit({ id: true, issuedAt: true, createdAt: true })
  .extend({
    recipientName: z.string().min(2, "Name must be at least 2 characters"),
    wpm: z.number().min(20, "Minimum 20 WPM required for certificate"),
    duration: z.number().min(300, "Minimum 5 minutes required for certificate"),
  });

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
