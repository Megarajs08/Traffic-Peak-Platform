import type { Request, Response, NextFunction } from "express";
import { getSessionUser } from "./session";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  (req as any).user = user;
  next();
}
