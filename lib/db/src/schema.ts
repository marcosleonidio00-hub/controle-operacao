import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

/* =========================
   USERS
========================= */
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),

  passwordHash: text("password_hash").notNull(),

  role: text("role").notNull().default("user"),
  active: boolean("active").notNull().default(true),

  permFluxoDados: boolean("perm_fluxo_dados").default(false),
  permFluxoCancelamento: boolean("perm_fluxo_cancelamento").default(false),
  permFluxoEmissao: boolean("perm_fluxo_emissao").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ORDERS
========================= */
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),

  orderNumber: text("order_number").notNull(),
  bookingNumber: text("booking_number"),

  customerName: text("customer_name"),
  supplier: text("supplier"),

  status: text("status"),

  amount: integer("amount"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   CANCELLATIONS
========================= */
export const cancellationsTable = pgTable("cancellations", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id"),
  userId: integer("user_id"),

  reason: text("reason"),
  status: text("status"),

  refundAmount: integer("refund_amount"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   GOALS
========================= */
export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),

  userId: integer("user_id"),

  month: integer("month"),
  year: integer("year"),

  targetAmount: integer("target_amount"),
  achievedAmount: integer("achieved_amount"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   INSTÂNCIA DO DB
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // configure sua URL do Postgres
});

export const db = drizzle(pool);