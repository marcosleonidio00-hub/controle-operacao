import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Sessão expirada ou não autorizada" });
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || !user.active) {
      return res.status(401).json({ error: "Usuário inválido ou inativo" });
    }

    (req as any).currentUser = user;
    next();
  } catch (e) {
    next(e);
  }
};

export const requireAdminOrMaster = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).currentUser;
  if (user?.role !== "admin" && user?.role !== "master") {
    return res.status(403).json({ error: "Acesso negado: Requer privilégios administrativos" });
  }
  next();
};