import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

// Listar usuários
router.get("/", requireAuth, async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

export default router;