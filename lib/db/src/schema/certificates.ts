import { pgTable, serial, integer, real, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { testResultsTable } from "./test_results";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: varchar("certificate_id", { length: 100 }).notNull().unique(),
  userId: integer("user_id").references(() => usersTable.id),
  testResultId: integer("test_result_id").references(() => testResultsTable.id),
  recipientName: varchar("recipient_name", { length: 200 }).notNull(),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  mode: varchar("mode", { length: 50 }).notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, issuedAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
