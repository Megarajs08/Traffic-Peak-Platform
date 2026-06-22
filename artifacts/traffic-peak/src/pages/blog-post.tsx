import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";
import { useGetPost, getGetPostQueryKey, useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Calendar, User, ChevronRight } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading, isError } = useGetPost(slug, {
    query: { enabled: !!slug, queryKey: getGetPostQueryKey(slug) },
  });

  const { data: related = [] } = useListPosts(
    { limit: 3, ...(post?.category ? { category: post.category } : {}) },
    { query: { enabled: !!post?.category, queryKey: getListPostsQueryKey({ limit: 3, category: post?.category ?? "" }) } }
  );

  const relatedPosts = related.filter((p) => p.slug !== slug).slice(0, 2);

  const structuredData = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt ?? "",
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        author: {
          "@type": "Person",
          name: post.authorName ?? "TypingPeak",
        },
        publisher: {
          "@type": "Organization",
          name: "TypingPeak",
          url: "https://typingpeak.vercel.app",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://typingpeak.vercel.app/blog/${post.slug}`,
        },
        ...(post.coverImageUrl
          ? { image: { "@type": "ImageObject", url: post.coverImageUrl } }
          : {}),
      }
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {post && (
        <SEOMeta
          title={post.title}
          description={post.excerpt ?? `Read "${post.title}" on TypingPeak â€” the typing speed platform.`}
          canonical={`https://typingpeak.vercel.app/blog/${post.slug}`}
          ogImage={post.coverImageUrl ?? undefined}
          ogType="article"
          structuredData={structuredData}
          keywords={`${post.category}, typing, ${post.title.split(" ").slice(0, 4).join(", ")}`}
        />
      )}
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumb
          items={[
            { label: "Blog", href: "/blog" },
            ...(post?.category ? [{ label: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` }] : []),
            ...(post ? [{ label: post.title }] : []),
          ]}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        ) : isError || !post ? (
          <div className="text-center py-16" data-testid="post-not-found">
            <h2 className="text-xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-4">This post may have been removed or the URL is incorrect.</p>
            <Link href="/blog" className="text-primary hover:underline text-sm">â† Back to Blog</Link>
          </div>
        ) : (
          <>
            <article data-testid="blog-post">
              {post.coverImageUrl && (
                <div className="rounded-xl overflow-hidden mb-8 aspect-video">
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" loading="eager" />
                </div>
              )}

              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="inline-block mb-2 text-sm text-primary font-medium hover:underline"
              >
                {post.category}
              </Link>

              <h1 className="text-3xl font-bold mb-4 leading-tight" data-testid="post-title">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
                {post.authorName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {post.authorName}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>

              <div className="text-foreground leading-relaxed">
                {post.content.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="mb-4 text-muted-foreground leading-7">{para}</p>
                ))}
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-8 border-t border-border/50">
                <h2 className="font-bold text-lg mb-6">More in {post.category}</h2>
                <div className="space-y-4">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/30 bg-card/40 transition-colors group">
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">{rp.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(rp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h2 className="font-bold text-lg mb-2">Put this into practice</h2>
              <p className="text-sm text-muted-foreground mb-4">Take a typing test and track your improvement.</p>
              <Link href="/typing-test" className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors inline-block">
                Start Typing Test
              </Link>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
