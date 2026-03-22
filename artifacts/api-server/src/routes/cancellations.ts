import { Router } from "express";
import { db, cancellationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js"; // Adicionado .js
import { eq } from "drizzle-orm";

const router = Router();

// 1. LISTAR TODOS
router.get("/", requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(cancellationsTable);
    return res.json({ data, total: data.length });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao buscar cancelamentos" });
  }
});

// 2. CRIAR NOVO
router.post("/", requireAuth, async (req, res) => {
  try {
    const { orderNumber, passenger, reason, assinaturaNome, assinaturaCargo } =
      req.body;

    const [newRecord] = await db
      .insert(cancellationsTable)
      .values({
        orderNumber,
        passenger,
        reason,
        status: "PENDENTE",
        createdBy: (req as any).user?.username || "Sistema",
        emailSent: false,
        createdAt: new Date(), // Remova o .toISOString()
        })
      .returning();

    return res.json(newRecord);
  } catch (e) {
    return res.status(500).json({ error: "Erro ao salvar cancelamento" });
  }
});

// 3. ATUALIZAR STATUS
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData: any = { status };
    if (status === "RESOLVIDO") {
      updateData.solutionDate = new Date().toISOString();
    }

    await db
      .update(cancellationsTable)
      .set(updateData)
      .where(eq(cancellationsTable.id, Number(id)));

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// 4. EXCLUIR REGISTRO (Para limpar as duplicidades)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .delete(cancellationsTable)
      .where(eq(cancellationsTable.id, Number(id)));

    return res.json({ success: true, message: "Registro removido" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao excluir do banco de dados" });
  }
});

export default router;