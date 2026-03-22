import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  supplier: text("supplier"),
  product: text("product"),
  startDate: text("start_date"),
  booking: text("booking"),
  emissionCost: real("emission_cost"),
  paxTotal: integer("pax_total"),
  agency: text("agency"),
  issuedBy: text("issued_by"),
  status: text("status").notNull().default("ATIVO"),
  deliveryStatus: text("delivery_status").notNull().default("PENDENTE"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
