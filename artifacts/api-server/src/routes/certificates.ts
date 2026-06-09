import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, certificatesTable, testResultsTable } from "@workspace/db";
import { GenerateCertificateBody, VerifyCertificateParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/certificates", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const certs = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.userId, user.id));

  res.json(
    certs.map((c) => ({
      id: c.id,
      certificateId: c.certificateId,
      userId: c.userId,
      testResultId: c.testResultId,
      recipientName: c.recipientName,
      wpm: c.wpm,
      accuracy: c.accuracy,
      duration: c.duration,
      mode: c.mode,
      issuedAt: c.issuedAt.toISOString(),
    }))
  );
});

router.post("/certificates", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const parsed = GenerateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { testResultId, recipientName } = parsed.data;

  const [testResult] = await db
    .select()
    .from(testResultsTable)
    .where(eq(testResultsTable.id, testResultId))
    .limit(1);

  if (!testResult) {
    res.status(404).json({ error: "Test result not found" });
    return;
  }

  const certificateId = `TP-${randomBytes(5).toString("hex").toUpperCase()}`;

  const [cert] = await db
    .insert(certificatesTable)
    .values({
      certificateId,
      userId: user.id,
      testResultId,
      recipientName,
      wpm: testResult.wpm,
      accuracy: testResult.accuracy,
      duration: testResult.duration,
      mode: testResult.mode,
    })
    .returning();

  res.status(201).json({
    id: cert.id,
    certificateId: cert.certificateId,
    userId: cert.userId,
    testResultId: cert.testResultId,
    recipientName: cert.recipientName,
    wpm: cert.wpm,
    accuracy: cert.accuracy,
    duration: cert.duration,
    mode: cert.mode,
    issuedAt: cert.issuedAt.toISOString(),
  });
});

router.get("/certificates/verify/:certificateId", async (req, res) => {
  const parsed = VerifyCertificateParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid certificate ID" });
    return;
  }

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.certificateId, parsed.data.certificateId))
    .limit(1);

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  res.json({
    id: cert.id,
    certificateId: cert.certificateId,
    userId: cert.userId,
    testResultId: cert.testResultId,
    recipientName: cert.recipientName,
    wpm: cert.wpm,
    accuracy: cert.accuracy,
    duration: cert.duration,
    mode: cert.mode,
    issuedAt: cert.issuedAt.toISOString(),
  });
});

export default router;
