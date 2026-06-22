import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { SEOMeta } from "@/components/SEOMeta";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreatePost,
  useUpdatePost,
  useGetPost,
  getAdminListPostsQueryKey,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Save } from "lucide-react";

const CATEGORIES = [
  "Typing Tips",
  "Typing Lessons",
  "Productivity",
  "Keyboard Guides",
  "Career Skills",
  "Government Exam Preparation",
];

interface FormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
  published: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PostForm() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [matchEdit, paramsEdit] = useRoute("/admin/posts/:id/edit");
  const isEdit = matchEdit && paramsEdit?.id !== "new";
  const editId = isEdit ? paramsEdit?.id ?? "" : "";

  const { data: existing } = useGetPost(editId, {
    query: { enabled: isEdit && !!editId, queryKey: ["getPost", editId] },
  });

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: CATEGORIES[0],
    coverImageUrl: "",
    published: false,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        content: existing.content,
        excerpt: existing.excerpt ?? "",
        category: existing.category,
        coverImageUrl: existing.coverImageUrl ?? "",
        published: existing.published,
      });
      setAutoSlug(false);
    }
  }, [existing]);

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => {
      const updated = { ...f, [name]: type === "checkbox" ? checked : value };
      if (name === "title" && autoSlug) {
        updated.slug = slugify(value);
      }
      if (name === "slug") setAutoSlug(false);
      return updated;
    });
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.slug.trim()) errs.slug = "Required";
    if (!form.content.trim()) errs.content = "Required";
    if (!form.category) errs.category = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const data = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt || undefined,
      category: form.category,
      coverImageUrl: form.coverImageUrl || undefined,
      published: form.published,
    };

    if (isEdit) {
      updatePost.mutate(
        { id: parseInt(editId), data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListPostsQueryKey({ limit: 100 }) });
            queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({ limit: 20 }) });
            setSaved(true);
            setTimeout(() => navigate("/admin"), 1200);
          },
        }
      );
    } else {
      createPost.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListPostsQueryKey({ limit: 100 }) });
            queryClient.invalidateQueries({ queryKey: getListPostsQueryKey({ limit: 20 }) });
            setSaved(true);
            setTimeout(() => navigate("/admin"), 1200);
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.error ?? err?.message ?? "Failed to create post";
            setSubmitError(msg);
          },
        }
      );
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <Link href="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta title={isEdit ? "Edit Post" : "New Post"} noIndex />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <h1 className="text-2xl font-bold mb-8">{isEdit ? "Edit Post" : "New Post"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Post title"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">/blog/</span>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="my-post-slug"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-background">{c}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Short summary shown in blog listing (optional)"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Content *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={16}
              placeholder="Post content (plain text, one paragraph per line)..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y font-mono"
            />
            {errors.content && <p className="text-xs text-destructive mt-1">{errors.content}</p>}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
            <input
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-3 bg-card/40 border border-border/60 rounded-lg px-4 py-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <div>
              <label htmlFor="published" className="text-sm font-medium cursor-pointer">Publish post</label>
              <p className="text-xs text-muted-foreground">Unchecked = draft (not visible to public)</p>
            </div>
          </div>

          {submitError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
              {submitError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending || saved} className="gap-2 min-w-32">
              {saved ? "Saved!" : isPending ? "Saving..." : (
                <><Save className="w-4 h-4" />{isEdit ? "Update Post" : "Create Post"}</>
              )}
            </Button>
            <Link href="/admin">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
