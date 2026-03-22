import { Router } from "express";
import { db, cancellationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(cancellationsTable);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar cancelamentos" });
  }
});

export default router;