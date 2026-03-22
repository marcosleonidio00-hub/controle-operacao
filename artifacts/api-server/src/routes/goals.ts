import { Router } from "express";
import { db, goalsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(goalsTable);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar metas" });
  }
});

export default router;