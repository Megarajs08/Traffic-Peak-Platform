import { Router, type IRouter } from "express";
import { eq, desc, sql, and, gte, count, max, avg, sum } from "drizzle-orm";
import { db, testResultsTable } from "@workspace/db";
import { GetProgressQueryParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/stats/me", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const [stats] = await db
    .select({
      bestWpm: max(testResultsTable.wpm),
      avgWpm: avg(testResultsTable.wpm),
      avgAccuracy: avg(testResultsTable.accuracy),
      totalTests: count(testResultsTable.id),
      totalDuration: sum(testResultsTable.duration),
    })
    .from(testResultsTable)
    .where(eq(testResultsTable.userId, user.id));

  const bestWpm = Number(stats?.bestWpm ?? 0);
  const avgWpm = Number(stats?.avgWpm ?? 0);
  const avgAccuracy = Number(stats?.avgAccuracy ?? 0);
  const totalTests = Number(stats?.totalTests ?? 0);
  const practiceMinutes = Math.floor(Number(stats?.totalDuration ?? 0) / 60);

  res.json({
    bestWpm,
    avgWpm: Math.round(avgWpm * 10) / 10,
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    totalTests,
    practiceMinutes,
    currentStreak: 0,
  });
});

router.get("/stats/progress", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const parsed = GetProgressQueryParams.safeParse(req.query);
  const period = parsed.success ? (parsed.data.period ?? "weekly") : "weekly";

  let daysBack = 7;
  if (period === "daily") daysBack = 1;
  else if (period === "weekly") daysBack = 7;
  else if (period === "monthly") daysBack = 30;

  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const sinceStr = since.toISOString();

  const rows = await db
    .select({
      date: sql<string>`DATE(${testResultsTable.createdAt})`,
      avgWpm: avg(testResultsTable.wpm),
      avgAccuracy: avg(testResultsTable.accuracy),
      testCount: count(testResultsTable.id),
    })
    .from(testResultsTable)
    .where(
      and(
        eq(testResultsTable.userId, user.id),
        gte(testResultsTable.createdAt, sinceStr)
      )
    )
    .groupBy(sql`DATE(${testResultsTable.createdAt})`)
    .orderBy(sql`DATE(${testResultsTable.createdAt})`);

  res.json(
    rows.map((r) => ({
      date: r.date,
      avgWpm: Math.round(Number(r.avgWpm) * 10) / 10,
      avgAccuracy: Math.round(Number(r.avgAccuracy) * 10) / 10,
      testCount: Number(r.testCount),
    }))
  );
});

router.get("/stats/summary", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [overall] = await db
    .select({
      bestWpm: max(testResultsTable.wpm),
      avgAccuracy: avg(testResultsTable.accuracy),
      totalTests: count(testResultsTable.id),
    })
    .from(testResultsTable)
    .where(eq(testResultsTable.userId, user.id));

  const [todayStats] = await db
    .select({ testsToday: count(testResultsTable.id) })
    .from(testResultsTable)
    .where(
      and(
        eq(testResultsTable.userId, user.id),
        gte(testResultsTable.createdAt, todayStr)
      )
    );

  res.json({
    bestWpm: Number(overall?.bestWpm ?? 0),
    testsToday: Number(todayStats?.testsToday ?? 0),
    currentStreak: 0,
    avgAccuracy: Math.round(Number(overall?.avgAccuracy ?? 0) * 10) / 10,
    totalTests: Number(overall?.totalTests ?? 0),
    rank: null,
  });
});

export default router;
