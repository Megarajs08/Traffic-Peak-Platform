import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, blogPostsTable, usersTable } from "@workspace/db";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

const OWNER_EMAIL = "megarajse@gmail.com";

async function requireAdmin(req: any, res: any) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return user;
}

async function requireOwner(req: any, res: any) {
  const user = await getSessionUser(req);
  if (!user || user.email !== OWNER_EMAIL) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return user;
}

function serializePost(row: any, authorName?: string | null) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    coverImageUrl: row.coverImageUrl,
    published: row.published,
    authorName: authorName ?? null,
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
  };
}

router.get("/admin/posts", async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const limit = parseInt(String(req.query.limit ?? 50));
  const offset = parseInt(String(req.query.offset ?? 0));

  const rows = await db
    .select({
      id: blogPostsTable.id,
      title: blogPostsTable.title,
      slug: blogPostsTable.slug,
      content: blogPostsTable.content,
      excerpt: blogPostsTable.excerpt,
      category: blogPostsTable.category,
      coverImageUrl: blogPostsTable.coverImageUrl,
      published: blogPostsTable.published,
      createdAt: blogPostsTable.createdAt,
      updatedAt: blogPostsTable.updatedAt,
      authorName: usersTable.username,
    })
    .from(blogPostsTable)
    .leftJoin(usersTable, eq(blogPostsTable.authorId, usersTable.id))
    .orderBy(desc(blogPostsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(rows.map((r) => serializePost(r, r.authorName)));
});

router.put("/admin/posts/:id", async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { title, slug, content, excerpt, category, coverImageUrl, published } = req.body;

  const [updated] = await db
    .update(blogPostsTable)
    .set({
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(category !== undefined && { category }),
      ...(coverImageUrl !== undefined && { coverImageUrl }),
      ...(published !== undefined && { published }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(blogPostsTable.id, id))
    .returning();

  res.json(serializePost(updated, user.username));
});

router.delete("/admin/posts/:id", async (req, res) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  res.status(204).send();
});

// ── User management ──────────────────────────────────────────────────────────

router.get("/admin/users", async (req, res) => {
  const actor = await requireOwner(req, res);
  if (!actor) return;

  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  res.json(users);
});

router.post("/admin/users/grant", async (req, res) => {
  const actor = await requireOwner(req, res);
  if (!actor) return;

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const [target] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase())).limit(1);
  if (!target) {
    res.status(404).json({ error: "No account found with that email" });
    return;
  }

  if (target.role === "admin") {
    res.status(400).json({ error: "User is already an admin" });
    return;
  }

  await db.update(usersTable).set({ role: "admin", updatedAt: new Date().toISOString() as any }).where(eq(usersTable.id, target.id));
  res.json({ message: `${target.email} is now an admin` });
});

router.post("/admin/users/revoke", async (req, res) => {
  const actor = await requireOwner(req, res);
  if (!actor) return;

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email is required" });
    return;
  }

  if (email.trim().toLowerCase() === actor.email.toLowerCase()) {
    res.status(400).json({ error: "You cannot revoke your own admin access" });
    return;
  }

  const [target] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase())).limit(1);
  if (!target) {
    res.status(404).json({ error: "No account found with that email" });
    return;
  }

  if (target.role !== "admin") {
    res.status(400).json({ error: "User is not an admin" });
    return;
  }

  await db.update(usersTable).set({ role: "user", updatedAt: new Date().toISOString() as any }).where(eq(usersTable.id, target.id));
  res.json({ message: `${target.email} admin access revoked` });
});

export default router;
