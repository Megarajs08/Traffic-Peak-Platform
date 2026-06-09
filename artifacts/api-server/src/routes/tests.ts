import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, testResultsTable } from "@workspace/db";
import { SubmitTestBody, GetTestParams, ListTestsQueryParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/tests", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const parsed = ListTestsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

  const results = await db
    .select()
    .from(testResultsTable)
    .where(eq(testResultsTable.userId, user.id))
    .orderBy(desc(testResultsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    results.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/tests", async (req, res) => {
  const user = await getSessionUser(req);

  const parsed = SubmitTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const [result] = await db
    .insert(testResultsTable)
    .values({
      userId: user?.id ?? null,
      ...parsed.data,
    })
    .returning();

  res.status(201).json({
    ...result,
    createdAt: result.createdAt.toISOString(),
  });
});

router.get("/tests/:id", async (req, res) => {
  const parsed = GetTestParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [result] = await db
    .select()
    .from(testResultsTable)
    .where(eq(testResultsTable.id, parsed.data.id))
    .limit(1);

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    ...result,
    createdAt: result.createdAt.toISOString(),
  });
});

export default router;
