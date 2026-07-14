import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, certificatesTable, testResultsTable } from "@workspace/db";
import { GenerateCertificateBody, VerifyCertificateParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";
import { toISOString } from "../lib/middleware";
import { generateCertificatePDF } from "../lib/pdf-certificate";

const router: IRouter = Router();

// Constants
const MIN_WPM = 20;
const MIN_DURATION = 30; // 30 seconds

// Validation helper
function validateCertificateEligibility(wpm: number, duration: number) {
  const errors = [];
  const reasons: { [key: string]: string | null } = {};
  
  if (duration < MIN_DURATION) {
    errors.push("insufficient_duration");
    reasons.duration_failed = `Only ${Math.round(duration)} seconds. Need minimum 30 seconds.`;
  } else {
    reasons.duration_failed = null;
  }
  
  if (wpm < MIN_WPM) {
    errors.push("insufficient_wpm");
    reasons.wpm_failed = `Only ${Math.round(wpm)} WPM. Need minimum 20 WPM for certificate.`;
  } else {
    reasons.wpm_failed = null;
  }
  
  return {
    eligible: errors.length === 0,
    errors,
    reasons: Object.fromEntries(Object.entries(reasons).filter(([_, v]) => v !== null)),
  };
}

// Get user's certificates
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
      level: c.level,
      issuedAt: toISOString(c.issuedAt),
    }))
  );
});

// Check eligibility before certificate generation
router.post("/certificates/check-eligibility", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const { testResultId } = req.body;
  
  const [testResult] = await db
    .select()
    .from(testResultsTable)
    .where(eq(testResultsTable.id, testResultId))
    .limit(1);

  if (!testResult) {
    res.status(404).json({ error: "Test result not found" });
    return;
  }

  const validation = validateCertificateEligibility(testResult.wpm, testResult.duration);
  
  res.json({
    eligible: validation.eligible,
    errors: validation.errors,
    reasons: validation.reasons,
    stats: {
      wpm: testResult.wpm,
      accuracy: testResult.accuracy,
      duration: testResult.duration,
      minWpm: MIN_WPM,
      minDuration: MIN_DURATION,
    },
  });
});

// Generate certificate
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

  // Validate eligibility
  const validation = validateCertificateEligibility(testResult.wpm, testResult.duration);
  if (!validation.eligible) {
    res.status(400).json({
      error: "Not eligible for certificate",
      errors: validation.errors,
      reasons: validation.reasons,
    });
    return;
  }

  const certificateId = `TPK-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

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
      level: getDifficultyLevel(testResult.wpm),
      issuedAt: new Date().toISOString(),
    })
    .returning();

  if (!cert) {
    res.status(500).json({ error: "Failed to create certificate" });
    return;
  }

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
    level: cert.level,
    issuedAt: toISOString(cert.issuedAt),
  });
});

// Get certificate by ID (public endpoint expected by client)
router.get("/certificates/:certificateId", async (req, res) => {
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
    level: cert.level,
    issuedAt: toISOString(cert.issuedAt),
  });
});

// Download certificate PDF by ID
router.get("/certificates/:certificateId/download", async (req, res) => {
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

  const pdf = await generateCertificatePDF(cert);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${cert.certificateId}.pdf"`,
  );
  res.send(pdf);
});

  // Verify certificate (public endpoint)
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
      level: cert.level,
      issuedAt: toISOString(cert.issuedAt),
    });
  });

// Helper function to determine difficulty level
function getDifficultyLevel(wpm: number): string {
  if (wpm >= 100) return "Advanced";
  if (wpm >= 60) return "Intermediate";
  if (wpm >= 40) return "Beginner";
  return "Novice";
}

export default router;
