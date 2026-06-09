import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, lessonsTable, lessonProgressTable } from "@workspace/db";
import { GetLessonParams, ListLessonsQueryParams, SaveLessonProgressBody, SaveLessonProgressParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/lessons/progress/all", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const progress = await db
    .select()
    .from(lessonProgressTable)
    .where(eq(lessonProgressTable.userId, user.id));

  res.json(
    progress.map((p) => ({
      id: p.id,
      lessonId: p.lessonId,
      userId: p.userId,
      wpm: p.wpm,
      accuracy: p.accuracy,
      bestWpm: p.bestWpm,
      completed: p.completed,
      completedAt: p.completedAt?.toISOString() ?? null,
    }))
  );
});

router.get("/lessons", async (req, res) => {
  const parsed = ListLessonsQueryParams.safeParse(req.query);
  const level = parsed.success ? parsed.data.level : undefined;

  const lessons = await db
    .select()
    .from(lessonsTable)
    .orderBy(lessonsTable.order);

  const filtered = level ? lessons.filter((l) => l.level === level) : lessons;

  res.json(
    filtered.map((l) => ({
      id: l.id,
      title: l.title,
      level: l.level,
      category: l.category,
      content: l.content,
      description: l.description,
      order: l.order,
    }))
  );
});

router.get("/lessons/:id", async (req, res) => {
  const parsed = GetLessonParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, parsed.data.id))
    .limit(1);

  if (!lesson) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    id: lesson.id,
    title: lesson.title,
    level: lesson.level,
    category: lesson.category,
    content: lesson.content,
    description: lesson.description,
    order: lesson.order,
  });
});

router.post("/lessons/:id/progress", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  const paramsParsed = SaveLessonProgressParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const bodyParsed = SaveLessonProgressBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const lessonId = paramsParsed.data.id;
  const { wpm, accuracy, completed } = bodyParsed.data;

  const [existing] = await db
    .select()
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, user.id),
        eq(lessonProgressTable.lessonId, lessonId)
      )
    )
    .limit(1);

  let progressRow;
  if (existing) {
    const [updated] = await db
      .update(lessonProgressTable)
      .set({
        wpm,
        accuracy,
        completed: completed || existing.completed,
        bestWpm: Math.max(existing.bestWpm, wpm),
        completedAt: completed && !existing.completed ? new Date() : existing.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(lessonProgressTable.id, existing.id))
      .returning();
    progressRow = updated;
  } else {
    const [inserted] = await db
      .insert(lessonProgressTable)
      .values({
        userId: user.id,
        lessonId,
        wpm,
        accuracy,
        bestWpm: wpm,
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      })
      .returning();
    progressRow = inserted;
  }

  res.json({
    id: progressRow.id,
    lessonId: progressRow.lessonId,
    userId: progressRow.userId,
    wpm: progressRow.wpm,
    accuracy: progressRow.accuracy,
    bestWpm: progressRow.bestWpm,
    completed: progressRow.completed,
    completedAt: progressRow.completedAt?.toISOString() ?? null,
  });
});

export default router;
