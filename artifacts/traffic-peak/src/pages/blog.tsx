import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Calendar, ChevronRight } from "lucide-react";

const CATEGORIES = [
  "All",
  "Typing Tips",
  "Typing Lessons",
  "Productivity",
  "Keyboard Guides",
  "Career Skills",
  "Government Exam Preparation",
];

const categoryDescriptions: Record<string, string> = {
  "Typing Tips": "Expert advice to improve your typing speed and accuracy.",
  "Typing Lessons": "Step-by-step lessons for beginners and advanced typists.",
  "Productivity": "Keyboard shortcuts, workflows, and habits to work faster.",
  "Keyboard Guides": "Reviews and recommendations for mechanical keyboards.",
  "Career Skills": "How typing speed impacts your career and job prospects.",
  "Government Exam Preparation": "Typing preparation guides for government and civil service exams.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "TrafficPeak Blog",
  description: "Typing tips, productivity guides, keyboard deep-dives, and government exam preparation resources.",
  url: "https://trafficpeak.replit.app/blog",
  publisher: {
    "@type": "Organization",
    name: "TrafficPeak",
    url: "https://trafficpeak.replit.app",
  },
};

export default function Blog() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategory = params.get("category") ?? undefined;
  const [category, setCategory] = useState<string | undefined>(initialCategory);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cat = p.get("category") ?? undefined;
    setCategory(cat);
  }, [search]);

  const { data: posts = [], isLoading } = useListPosts(
    { limit: 50, ...(category ? { category } : {}) },
    { query: { queryKey: getListPostsQueryKey({ limit: 50, ...(category ? { category } : {}) }) } }
  );

  const activeCategory = category || "All";
  const pageTitle = category ? `${category} — Blog` : "Blog";
  const pageDesc = category
    ? categoryDescriptions[category] ?? `Blog posts about ${category} on TrafficPeak.`
    : "Typing tips, productivity guides, keyboard deep-dives, and government exam preparation resources.";

  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title={pageTitle}
        description={pageDesc}
        structuredData={structuredData}
        keywords={`typing blog, ${category ?? "typing tips, typing lessons, productivity, keyboard guides"}, trafficpeak`}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumb
          items={
            category
              ? [{ label: "Blog", href: "/blog" }, { label: category }]
              : [{ label: "Blog" }]
          }
        />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="blog-heading">
            {category ? category : "Blog"}
          </h1>
          <p className="text-muted-foreground">{pageDesc}</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8" data-testid="blog-categories">
          {CATEGORIES.map((cat) => {
            const val = cat === "All" ? undefined : cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`blog-cat-${cat.toLowerCase().replace(/[\s/]+/g, "-")}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground" data-testid="empty-blog">
            No posts in this category yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-testid={`blog-card-${post.id}`}
              >
                <Link href={`/blog/${post.slug}`} className="block group h-full">
                  <article className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 transition-colors h-full flex flex-col">
                    {post.coverImageUrl && (
                      <div className="aspect-video bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs text-primary font-medium">{post.category}</span>
                      <h2 className="font-semibold mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1" data-testid={`blog-title-${post.id}`}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
