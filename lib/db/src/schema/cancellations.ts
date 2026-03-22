import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cancellationsTable = pgTable("cancellations", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  supplier: text("supplier"),
  product: text("product"),
  passenger: text("passenger"),
  booking: text("booking"),
  value: real("value"),
  useDate: text("use_date"),
  pax: integer("pax"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("PENDENTE"),
  createdBy: text("created_by").notNull(),
  sendDate: timestamp("send_date").defaultNow(),
  solutionDate: timestamp("solution_date"),
  daysPending: integer("days_pending").default(0),
  emailSent: boolean("email_sent").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCancellationSchema = createInsertSchema(cancellationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCancellation = z.infer<typeof insertCancellationSchema>;
export type Cancellation = typeof cancellationsTable.$inferSelect;
