import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, blogPostsTable, usersTable } from "@workspace/db";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin") {
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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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
      updatedAt: new Date(),
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

export default router;
