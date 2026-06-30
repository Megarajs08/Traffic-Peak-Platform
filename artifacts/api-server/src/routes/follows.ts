import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, usersTable, followsTable } from "@workspace/db";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

// POST /users/:username/follow — follow a user
router.post("/users/:username/follow", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

  const [target] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, req.params.username))
    .limit(1);

  if (!target) { res.status(404).json({ error: "User not found" }); return; }
  if (target.id === user.id) { res.status(400).json({ error: "Cannot follow yourself" }); return; }

  await db
    .insert(followsTable)
    .values({ followerId: user.id, followingId: target.id, createdAt: new Date().toISOString() })
    .onConflictDoNothing();

  res.json({ following: true });
});

// DELETE /users/:username/follow — unfollow a user
router.delete("/users/:username/follow", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

  const [target] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, req.params.username))
    .limit(1);

  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  await db
    .delete(followsTable)
    .where(
      and(
        eq(followsTable.followerId, user.id),
        eq(followsTable.followingId, target.id)
      )
    );

  res.json({ following: false });
});

// GET /users/:username/follow-status — check if current user follows this profile
router.get("/users/:username/follow-status", async (req, res) => {
  const user = await getSessionUser(req);

  const [target] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, req.params.username))
    .limit(1);

  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  if (!user) {
    res.json({ following: false, followers: 0, following_count: 0 });
    return;
  }

  const [followRow] = await db
    .select()
    .from(followsTable)
    .where(
      and(eq(followsTable.followerId, user.id), eq(followsTable.followingId, target.id))
    )
    .limit(1);

  const [{ followers }] = await db
    .select({ followers: count() })
    .from(followsTable)
    .where(eq(followsTable.followingId, target.id));

  const [{ following_count }] = await db
    .select({ following_count: count() })
    .from(followsTable)
    .where(eq(followsTable.followerId, target.id));

  res.json({
    following: !!followRow,
    followers: Number(followers),
    following_count: Number(following_count),
  });
});

export default router;
