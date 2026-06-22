import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, hrAssessmentsTable, assessmentCandidatesTable, assessmentResultsTable } from "@workspace/db";

const router: IRouter = Router();

// GET /assessment/:token — public, no auth
router.get("/assessment/:token", async (req, res) => {
  const { token } = req.params;

  const [assessment] = await db
    .select()
    .from(hrAssessmentsTable)
    .where(eq(hrAssessmentsTable.token, token.toUpperCase()))
    .limit(1);

  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }
  if (!assessment.active) { res.status(404).json({ error: "Assessment is no longer active" }); return; }
  if (assessment.expiresAt && new Date(assessment.expiresAt) < new Date()) {
    res.status(404).json({ error: "Assessment has expired" }); return;
  }

  res.json({
    id: assessment.id,
    token: assessment.token,
    name: assessment.name,
    companyName: assessment.companyName,
    jobPosition: assessment.jobPosition,
    description: assessment.description ?? null,
    durationSeconds: assessment.durationSeconds,
    difficulty: assessment.difficulty,
    language: assessment.language,
    contentType: assessment.contentType,
    customText: assessment.customText ?? null,
    passingWpm: assessment.passingWpm,
    minAccuracy: assessment.minAccuracy,
    maxAttempts: assessment.maxAttempts,
    expiresAt: assessment.expiresAt ? assessment.expiresAt.toISOString() : null,
  });
});

// POST /assessment/:token/start
router.post("/assessment/:token/start", async (req, res) => {
  const { token } = req.params;
  const { fullName, email, phone, fingerprint } = req.body;

  if (!fullName || !email) {
    res.status(400).json({ error: "fullName and email are required" });
    return;
  }

  const [assessment] = await db
    .select()
    .from(hrAssessmentsTable)
    .where(eq(hrAssessmentsTable.token, token.toUpperCase()))
    .limit(1);

  if (!assessment || !assessment.active) {
    res.status(404).json({ error: "Assessment not found or inactive" });
    return;
  }
  if (assessment.expiresAt && new Date(assessment.expiresAt) < new Date()) {
    res.status(404).json({ error: "Assessment has expired" });
    return;
  }

  // Check attempt count
  const existing = await db
    .select()
    .from(assessmentCandidatesTable)
    .where(
      and(
        eq(assessmentCandidatesTable.assessmentId, assessment.id),
        eq(assessmentCandidatesTable.email, email.toLowerCase().trim()),
      )
    );

  if (existing.length >= assessment.maxAttempts) {
    res.status(400).json({ error: `Maximum ${assessment.maxAttempts} attempt(s) allowed for this email` });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] ?? req.socket.remoteAddress ?? null;
  const ua = req.headers["user-agent"] ?? null;
  const attemptNumber = existing.length + 1;

  const [candidate] = await db.insert(assessmentCandidatesTable).values({
    assessmentId: assessment.id,
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone ?? null,
    ipAddress: ip,
    userAgent: ua,
    fingerprint: fingerprint ?? null,
    tabSwitches: 0,
    attemptNumber,
    startedAt: new Date().toISOString(),
  }).returning();

  res.status(201).json({
    candidateId: candidate.id,
    assessmentId: assessment.id,
    durationSeconds: assessment.durationSeconds,
    contentType: assessment.contentType,
    customText: assessment.customText ?? null,
    passingWpm: assessment.passingWpm,
    minAccuracy: assessment.minAccuracy,
  });
});

// POST /assessment/:token/submit
router.post("/assessment/:token/submit", async (req, res) => {
  const { token } = req.params;
  const { candidateId, wpm, cpm, accuracy, errorCount, charCount, durationSeconds, tabSwitches } = req.body;

  if (!candidateId || wpm === undefined) {
    res.status(400).json({ error: "candidateId and wpm are required" });
    return;
  }

  const [assessment] = await db
    .select()
    .from(hrAssessmentsTable)
    .where(eq(hrAssessmentsTable.token, token.toUpperCase()))
    .limit(1);

  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const [candidate] = await db
    .select()
    .from(assessmentCandidatesTable)
    .where(
      and(
        eq(assessmentCandidatesTable.id, candidateId),
        eq(assessmentCandidatesTable.assessmentId, assessment.id),
      )
    )
    .limit(1);

  if (!candidate) { res.status(404).json({ error: "Candidate session not found" }); return; }

  // Update tab switches
  if (tabSwitches !== undefined) {
    await db.update(assessmentCandidatesTable)
      .set({ tabSwitches, submittedAt: new Date().toISOString() })
      .where(eq(assessmentCandidatesTable.id, candidateId));
  } else {
    await db.update(assessmentCandidatesTable)
      .set({ submittedAt: new Date().toISOString() })
      .where(eq(assessmentCandidatesTable.id, candidateId));
  }

  const passed = wpm >= assessment.passingWpm && accuracy >= assessment.minAccuracy;

  const [result] = await db.insert(assessmentResultsTable).values({
    candidateId,
    assessmentId: assessment.id,
    wpm,
    cpm: cpm ?? wpm * 5,
    accuracy,
    errorCount: errorCount ?? 0,
    charCount: charCount ?? 0,
    durationSeconds: durationSeconds ?? assessment.durationSeconds,
    passed,
    rank: null,
  }).returning();

  res.json({
    id: result.id,
    wpm: result.wpm,
    cpm: result.cpm,
    accuracy: result.accuracy,
    errorCount: result.errorCount,
    passed: result.passed,
    passingWpm: assessment.passingWpm,
    minAccuracy: assessment.minAccuracy,
    companyName: assessment.companyName,
    jobPosition: assessment.jobPosition,
  });
});

export default router;
