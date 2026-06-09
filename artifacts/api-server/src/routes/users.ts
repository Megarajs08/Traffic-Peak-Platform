import { Router, type IRouter } from "express";
import { eq, max, avg, count } from "drizzle-orm";
import { db, usersTable, testResultsTable } from "@workspace/db";
import { GetUserProfileParams, UpdateMyProfileBody } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/users/me/profile", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/users/me/profile", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    name: updated.name,
    avatarUrl: updated.avatarUrl,
    role: updated.role,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/users/:username", async (req, res) => {
  const parsed = GetUserProfileParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid username" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, parsed.data.username))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [stats] = await db
    .select({
      bestWpm: max(testResultsTable.wpm),
      avgWpm: avg(testResultsTable.wpm),
      avgAccuracy: avg(testResultsTable.accuracy),
      totalTests: count(testResultsTable.id),
    })
    .from(testResultsTable)
    .where(eq(testResultsTable.userId, user.id));

  res.json({
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bestWpm: Number(stats?.bestWpm ?? 0),
    avgWpm: Math.round(Number(stats?.avgWpm ?? 0) * 10) / 10,
    avgAccuracy: Math.round(Number(stats?.avgAccuracy ?? 0) * 10) / 10,
    totalTests: Number(stats?.totalTests ?? 0),
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
