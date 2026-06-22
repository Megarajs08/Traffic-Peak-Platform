import { Router, type IRouter } from "express";
import { eq, desc, max, avg, count, sql, and, gte } from "drizzle-orm";
import { db, testResultsTable, usersTable } from "@workspace/db";
import { GetLeaderboardQueryParams, GetMyRankQueryParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  const period = parsed.success ? (parsed.data.period ?? "all") : "all";
  const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;

  let sinceStr: string | null = null;
  if (period === "weekly") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    sinceStr = d.toISOString();
  } else if (period === "monthly") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    sinceStr = d.toISOString();
  }

  const rows = await db
    .select({
      userId: testResultsTable.userId,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
      wpm: max(testResultsTable.wpm),
      accuracy: avg(testResultsTable.accuracy),
      testCount: count(testResultsTable.id),
    })
    .from(testResultsTable)
    .innerJoin(usersTable, eq(testResultsTable.userId, usersTable.id))
    .where(
      sinceStr
        ? and(sql`${testResultsTable.userId} IS NOT NULL`, gte(testResultsTable.createdAt, sinceStr))
        : sql`${testResultsTable.userId} IS NOT NULL`
    )
    .groupBy(testResultsTable.userId, usersTable.username, usersTable.avatarUrl)
    .orderBy(desc(max(testResultsTable.wpm)))
    .limit(limit);

  res.json(
    rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId!,
      username: r.username,
      avatarUrl: r.avatarUrl,
      wpm: Math.round(Number(r.wpm) * 10) / 10,
      accuracy: Math.round(Number(r.accuracy) * 10) / 10,
      testCount: Number(r.testCount),
    }))
  );
});

router.get("/leaderboard/rank", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.json({ rank: null, wpm: 0, accuracy: 0, totalUsers: 0 });
    return;
  }

  const parsed = GetMyRankQueryParams.safeParse(req.query);
  const period = parsed.success ? (parsed.data.period ?? "all") : "all";

  let sinceStr2: string | null = null;
  if (period === "weekly") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    sinceStr2 = d.toISOString();
  } else if (period === "monthly") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    sinceStr2 = d.toISOString();
  }

  const allRows = await db
    .select({
      userId: testResultsTable.userId,
      bestWpm: max(testResultsTable.wpm),
      avgAccuracy: avg(testResultsTable.accuracy),
    })
    .from(testResultsTable)
    .where(
      sinceStr2
        ? and(sql`${testResultsTable.userId} IS NOT NULL`, gte(testResultsTable.createdAt, sinceStr2))
        : sql`${testResultsTable.userId} IS NOT NULL`
    )
    .groupBy(testResultsTable.userId)
    .orderBy(desc(max(testResultsTable.wpm)));

  const myIndex = allRows.findIndex((r) => r.userId === user.id);
  const myRow = myIndex >= 0 ? allRows[myIndex] : null;

  res.json({
    rank: myIndex >= 0 ? myIndex + 1 : null,
    wpm: Math.round(Number(myRow?.bestWpm ?? 0) * 10) / 10,
    accuracy: Math.round(Number(myRow?.avgAccuracy ?? 0) * 10) / 10,
    totalUsers: allRows.length,
  });
});

export default router;
