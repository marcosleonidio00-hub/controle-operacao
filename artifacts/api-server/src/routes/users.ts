import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdminOrMaster } from "../middlewares/auth";

const router = Router();

// Listar usuários (Apenas Admin/Master)
router.get("/", requireAuth, requireAdminOrMaster, async (req, res) => {
  try {
    const allUsers = await db.select().from(usersTable);
    return res.json(allUsers);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Outras rotas de usuários viriam aqui...

export default router;
