import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    active: u.active,
    permissions: {
      fluxoDados: u.permFluxoDados,
      fluxoCancelamento: u.permFluxoCancelamento,
      fluxoEmissao: u.permFluxoEmissao,
    },
    createdAt: u.createdAt
  };
}

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: "Login e senha são obrigatórios" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, login), eq(usersTable.username, login)))
      .limit(1);

    if (!user || !user.active) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    (req as any).session.userId = user.id;
    return res.json({ user: formatUser(user), message: "Login realizado com sucesso" });
  } catch (e) {
    req.log.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logout realizado" });
  });
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json(formatUser((req as any).currentUser));
});

export default router;