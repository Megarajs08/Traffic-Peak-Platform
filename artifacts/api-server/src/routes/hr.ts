import { Router, type IRouter } from "express";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";
import { db, hrAssessmentsTable, assessmentCandidatesTable, assessmentResultsTable, usersTable } from "@workspace/db";
import { getSessionUser } from "../lib/session";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateToken(): string {
  return randomBytes(16).toString("hex").toUpperCase();
}

async function requireAuth(req: any, res: any) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return user;
}

function serializeAssessment(row: any) {
  return {
    id: row.id,
    token: row.token,
    createdById: row.createdById,
    name: row.name,
    companyName: row.companyName,
    jobPosition: row.jobPosition,
    description: row.description ?? null,
    durationSeconds: row.durationSeconds,
    difficulty: row.difficulty,
    language: row.language,
    contentType: row.contentType,
    customText: row.customText ?? null,
    passingWpm: row.passingWpm,
    minAccuracy: row.minAccuracy,
    maxAttempts: row.maxAttempts,
    active: row.active,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    candidateCount: row.candidateCount ?? 0,
    passCount: row.passCount ?? 0,
  };
}

// GET /hr/assessments
router.get("/hr/assessments", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const rows = await db
    .select({
      id: hrAssessmentsTable.id,
      token: hrAssessmentsTable.token,
      createdById: hrAssessmentsTable.createdById,
      name: hrAssessmentsTable.name,
      companyName: hrAssessmentsTable.companyName,
      jobPosition: hrAssessmentsTable.jobPosition,
      description: hrAssessmentsTable.description,
      durationSeconds: hrAssessmentsTable.durationSeconds,
      difficulty: hrAssessmentsTable.difficulty,
      language: hrAssessmentsTable.language,
      contentType: hrAssessmentsTable.contentType,
      customText: hrAssessmentsTable.customText,
      passingWpm: hrAssessmentsTable.passingWpm,
      minAccuracy: hrAssessmentsTable.minAccuracy,
      maxAttempts: hrAssessmentsTable.maxAttempts,
      active: hrAssessmentsTable.active,
      expiresAt: hrAssessmentsTable.expiresAt,
      createdAt: hrAssessmentsTable.createdAt,
      updatedAt: hrAssessmentsTable.updatedAt,
      candidateCount: sql<number>`cast(count(distinct ${assessmentCandidatesTable.id}) as int)`,
      passCount: sql<number>`cast(count(distinct ${assessmentResultsTable.id}) filter (where ${assessmentResultsTable.passed} = true) as int)`,
    })
    .from(hrAssessmentsTable)
    .leftJoin(assessmentCandidatesTable, eq(assessmentCandidatesTable.assessmentId, hrAssessmentsTable.id))
    .leftJoin(assessmentResultsTable, eq(assessmentResultsTable.assessmentId, hrAssessmentsTable.id))
    .where(eq(hrAssessmentsTable.createdById, user.id))
    .groupBy(hrAssessmentsTable.id)
    .orderBy(desc(hrAssessmentsTable.createdAt));

  res.json(rows.map(serializeAssessment));
});

// POST /hr/assessments
router.post("/hr/assessments", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const {
    name, companyName, jobPosition, description,
    durationSeconds, difficulty, language, contentType, customText,
    passingWpm, minAccuracy, maxAttempts, active, expiresAt,
  } = req.body;

  if (!name || !companyName || !jobPosition) {
    res.status(400).json({ error: "name, companyName, jobPosition are required" });
    return;
  }

  // Upgrade role to hr if still "user"
  if (user.role === "user") {
    await db.update(usersTable).set({ role: "hr" }).where(eq(usersTable.id, user.id));
  }

  const [row] = await db.insert(hrAssessmentsTable).values({
    token: generateToken(),
    createdById: user.id,
    name,
    companyName,
    jobPosition,
    description: description ?? null,
    durationSeconds: durationSeconds ?? 300,
    difficulty: difficulty ?? "medium",
    language: language ?? "english",
    contentType: contentType ?? "words",
    customText: customText ?? null,
    passingWpm: passingWpm ?? 40,
    minAccuracy: minAccuracy ?? 90,
    maxAttempts: maxAttempts ?? 1,
    active: active ?? true,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();

  res.status(201).json(serializeAssessment({ ...row, candidateCount: 0, passCount: 0 }));
});

// GET /hr/assessments/:id
router.get("/hr/assessments/:id", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [assessment] = await db
    .select()
    .from(hrAssessmentsTable)
    .where(and(eq(hrAssessmentsTable.id, id), eq(hrAssessmentsTable.createdById, user.id)))
    .limit(1);

  if (!assessment) { res.status(404).json({ error: "Not found" }); return; }

  const candidates = await db
    .select({
      candidateId: assessmentCandidatesTable.id,
      fullName: assessmentCandidatesTable.fullName,
      email: assessmentCandidatesTable.email,
      phone: assessmentCandidatesTable.phone,
      tabSwitches: assessmentCandidatesTable.tabSwitches,
      startedAt: assessmentCandidatesTable.startedAt,
      submittedAt: assessmentCandidatesTable.submittedAt,
      resultId: assessmentResultsTable.id,
      wpm: assessmentResultsTable.wpm,
      cpm: assessmentResultsTable.cpm,
      accuracy: assessmentResultsTable.accuracy,
      errorCount: assessmentResultsTable.errorCount,
      passed: assessmentResultsTable.passed,
      rank: assessmentResultsTable.rank,
      resultCreatedAt: assessmentResultsTable.createdAt,
    })
    .from(assessmentCandidatesTable)
    .leftJoin(assessmentResultsTable, eq(assessmentResultsTable.candidateId, assessmentCandidatesTable.id))
    .where(eq(assessmentCandidatesTable.assessmentId, id))
    .orderBy(desc(assessmentResultsTable.wpm));

  res.json({
    ...serializeAssessment({ ...assessment, candidateCount: candidates.length, passCount: candidates.filter(c => c.passed).length }),
    candidates: candidates.map((c, i) => ({
      id: c.candidateId,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone ?? null,
      tabSwitches: c.tabSwitches,
      startedAt: c.startedAt?.toISOString() ?? null,
      submittedAt: c.submittedAt?.toISOString() ?? null,
      wpm: c.wpm ?? null,
      cpm: c.cpm ?? null,
      accuracy: c.accuracy ?? null,
      errorCount: c.errorCount ?? null,
      passed: c.passed ?? null,
      rank: i + 1,
      completedAt: c.resultCreatedAt?.toISOString() ?? null,
    })),
  });
});

// PUT /hr/assessments/:id
router.put("/hr/assessments/:id", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(hrAssessmentsTable)
    .where(and(eq(hrAssessmentsTable.id, id), eq(hrAssessmentsTable.createdById, user.id))).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const {
    name, companyName, jobPosition, description,
    durationSeconds, difficulty, language, contentType, customText,
    passingWpm, minAccuracy, maxAttempts, active, expiresAt,
  } = req.body;

  const [updated] = await db.update(hrAssessmentsTable).set({
    ...(name !== undefined && { name }),
    ...(companyName !== undefined && { companyName }),
    ...(jobPosition !== undefined && { jobPosition }),
    ...(description !== undefined && { description }),
    ...(durationSeconds !== undefined && { durationSeconds }),
    ...(difficulty !== undefined && { difficulty }),
    ...(language !== undefined && { language }),
    ...(contentType !== undefined && { contentType }),
    ...(customText !== undefined && { customText }),
    ...(passingWpm !== undefined && { passingWpm }),
    ...(minAccuracy !== undefined && { minAccuracy }),
    ...(maxAttempts !== undefined && { maxAttempts }),
    ...(active !== undefined && { active }),
    ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null }),
    updatedAt: new Date().toISOString(),
  }).where(eq(hrAssessmentsTable.id, id)).returning();

  res.json(serializeAssessment({ ...updated, candidateCount: 0, passCount: 0 }));
});

// DELETE /hr/assessments/:id
router.delete("/hr/assessments/:id", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(hrAssessmentsTable)
    .where(and(eq(hrAssessmentsTable.id, id), eq(hrAssessmentsTable.createdById, user.id))).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(assessmentResultsTable).where(eq(assessmentResultsTable.assessmentId, id));
  await db.delete(assessmentCandidatesTable).where(eq(assessmentCandidatesTable.assessmentId, id));
  await db.delete(hrAssessmentsTable).where(eq(hrAssessmentsTable.id, id));
  res.status(204).send();
});

// GET /hr/assessments/:id/results
router.get("/hr/assessments/:id/results", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [assessment] = await db.select().from(hrAssessmentsTable)
    .where(and(eq(hrAssessmentsTable.id, id), eq(hrAssessmentsTable.createdById, user.id))).limit(1);
  if (!assessment) { res.status(404).json({ error: "Not found" }); return; }

  const rows = await db
    .select({
      candidateId: assessmentCandidatesTable.id,
      fullName: assessmentCandidatesTable.fullName,
      email: assessmentCandidatesTable.email,
      phone: assessmentCandidatesTable.phone,
      tabSwitches: assessmentCandidatesTable.tabSwitches,
      submittedAt: assessmentCandidatesTable.submittedAt,
      wpm: assessmentResultsTable.wpm,
      cpm: assessmentResultsTable.cpm,
      accuracy: assessmentResultsTable.accuracy,
      errorCount: assessmentResultsTable.errorCount,
      passed: assessmentResultsTable.passed,
      completedAt: assessmentResultsTable.createdAt,
    })
    .from(assessmentCandidatesTable)
    .leftJoin(assessmentResultsTable, eq(assessmentResultsTable.candidateId, assessmentCandidatesTable.id))
    .where(eq(assessmentCandidatesTable.assessmentId, id))
    .orderBy(desc(assessmentResultsTable.wpm));

  let results = rows.map((r, i) => ({
    id: r.candidateId,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone ?? null,
    tabSwitches: r.tabSwitches,
    wpm: r.wpm ?? 0,
    cpm: r.cpm ?? 0,
    accuracy: r.accuracy ?? 0,
    errorCount: r.errorCount ?? 0,
    passed: r.passed ?? false,
    rank: i + 1,
    completedAt: r.completedAt?.toISOString() ?? null,
  }));

  const { status, search } = req.query;
  if (status === "pass") results = results.filter(r => r.passed);
  if (status === "fail") results = results.filter(r => !r.passed);
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(r =>
      r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// GET /hr/dashboard/stats
router.get("/hr/dashboard/stats", async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;

  const [totals] = await db
    .select({
      totalAssessments: sql<number>`cast(count(distinct ${hrAssessmentsTable.id}) as int)`,
      activeAssessments: sql<number>`cast(count(distinct ${hrAssessmentsTable.id}) filter (where ${hrAssessmentsTable.active} = true) as int)`,
      totalCandidates: sql<number>`cast(count(distinct ${assessmentCandidatesTable.id}) as int)`,
      avgWpm: sql<number>`round(avg(${assessmentResultsTable.wpm})::numeric, 1)`,
      avgAccuracy: sql<number>`round(avg(${assessmentResultsTable.accuracy})::numeric, 1)`,
      passCount: sql<number>`cast(count(distinct ${assessmentResultsTable.id}) filter (where ${assessmentResultsTable.passed} = true) as int)`,
      totalResults: sql<number>`cast(count(distinct ${assessmentResultsTable.id}) as int)`,
    })
    .from(hrAssessmentsTable)
    .leftJoin(assessmentCandidatesTable, eq(assessmentCandidatesTable.assessmentId, hrAssessmentsTable.id))
    .leftJoin(assessmentResultsTable, eq(assessmentResultsTable.assessmentId, hrAssessmentsTable.id))
    .where(eq(hrAssessmentsTable.createdById, user.id));

  const totalResults = totals?.totalResults ?? 0;
  const passRate = totalResults > 0 ? Math.round(((totals?.passCount ?? 0) / totalResults) * 100) : 0;

  res.json({
    totalAssessments: totals?.totalAssessments ?? 0,
    activeAssessments: totals?.activeAssessments ?? 0,
    totalCandidates: totals?.totalCandidates ?? 0,
    avgWpm: totals?.avgWpm ?? 0,
    avgAccuracy: totals?.avgAccuracy ?? 0,
    passRate,
  });
});

export default router;
