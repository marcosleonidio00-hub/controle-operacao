import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable);
    return res.json(orders);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

export default router;