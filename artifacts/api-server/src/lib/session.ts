import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";
import type { Request, Response } from "express";

const SESSION_COOKIE = "tp_session";
const SESSION_TTL_DAYS = 30;

export async function createSession(userId: number, res: Response): Promise<string> {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await db.insert(sessionsTable).values({ id: sessionId, userId, expiresAt });

  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSessionUser(req: Request) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .limit(1);

  if (!session || session.expiresAt < new Date()) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function deleteSession(req: Request, res: Response) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
