import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { testResultsTable } from "./test_results";

export const certificatesTable = sqliteTable("certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  certificateId: text("certificate_id").notNull().unique(),
  userId: integer("user_id").references(() => usersTable.id),
  testResultId: integer("test_result_id").references(() => testResultsTable.id),
  recipientName: text("recipient_name").notNull(),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  mode: text("mode").notNull(),
  issuedAt: text("issued_at").notNull().default(""),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, issuedAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
