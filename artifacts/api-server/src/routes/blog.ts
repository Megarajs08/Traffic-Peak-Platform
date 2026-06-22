import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, blogPostsTable, usersTable } from "@workspace/db";
import { CreatePostBody, GetPostParams, ListPostsQueryParams } from "@workspace/api-zod";
import { getSessionUser } from "../lib/session";

const router: IRouter = Router();

router.get("/blog", async (req, res) => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;
  const category = parsed.success ? parsed.data.category : undefined;

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
    .where(
      category
        ? and(eq(blogPostsTable.published, true), eq(blogPostsTable.category, category))
        : eq(blogPostsTable.published, true)
    )
    .orderBy(desc(blogPostsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      content: r.content,
      excerpt: r.excerpt,
      category: r.category,
      coverImageUrl: r.coverImageUrl,
      published: r.published,
      authorName: r.authorName,
      createdAt: r.createdAt || "",
      updatedAt: r.updatedAt || "",
    }))
  );
});

router.post("/blog", async (req, res) => {
  const user = await getSessionUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const now = new Date().toISOString();
  let post: typeof blogPostsTable.$inferSelect;
  try {
    const [inserted] = await db
      .insert(blogPostsTable)
      .values({ ...parsed.data, authorId: user.id, createdAt: now, updatedAt: now })
      .returning();
    post = inserted;
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE constraint failed: blog_posts.slug")) {
      res.status(409).json({ error: "A post with this slug already exists. Please use a different slug." });
      return;
    }
    throw err;
  }

  res.status(201).json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    category: post.category,
    coverImageUrl: post.coverImageUrl,
    published: post.published,
    authorName: user.username,
    createdAt: post.createdAt || now,
    updatedAt: post.updatedAt || now,
  });
});

router.get("/blog/:slug", async (req, res) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }

  const [row] = await db
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
    .where(eq(blogPostsTable.slug, parsed.data.slug))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    coverImageUrl: row.coverImageUrl,
    published: row.published,
    authorName: row.authorName,
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
  });
});

export default router;
