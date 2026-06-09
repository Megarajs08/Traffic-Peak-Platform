import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useGetPost, getGetPostQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading, isError } = useGetPost(slug, {
    query: { enabled: !!slug, queryKey: getGetPostQueryKey(slug) },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-back-blog">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        ) : isError || !post ? (
          <div className="text-center py-16" data-testid="post-not-found">
            <h2 className="text-xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground">This post may have been removed or the URL is incorrect.</p>
          </div>
        ) : (
          <article data-testid="blog-post">
            {post.coverImageUrl && (
              <div className="rounded-xl overflow-hidden mb-8 aspect-video">
                <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="mb-2 text-sm text-primary font-medium">{post.category}</div>
            <h1 className="text-3xl font-bold mb-4" data-testid="post-title">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              {post.authorName && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {post.authorName}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-foreground leading-relaxed">
              {post.content.split("\n").map((para, i) => (
                <p key={i} className="mb-4 text-muted-foreground">{para}</p>
              ))}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
