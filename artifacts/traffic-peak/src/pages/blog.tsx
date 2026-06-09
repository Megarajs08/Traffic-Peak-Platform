import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Calendar, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Typing Tips", "Productivity", "Keyboard Guides", "Career Skills"];

export default function Blog() {
  const [category, setCategory] = useState<string | undefined>(undefined);

  const { data: posts = [], isLoading } = useListPosts(
    { limit: 20, ...(category ? { category } : {}) },
    { query: { queryKey: getListPostsQueryKey({ limit: 20, ...(category ? { category } : {}) }) } }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="blog-heading">Blog</h1>
          <p className="text-muted-foreground">Typing tips, productivity guides, and keyboard deep-dives.</p>
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
                  category === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`blog-cat-${cat.toLowerCase().replace(/\s/g, "-")}`}
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
            No posts yet. Check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                data-testid={`blog-card-${post.id}`}
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <div className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/30 transition-colors h-full">
                    {post.coverImageUrl && (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs text-primary font-medium">{post.category}</span>
                      <h2 className="font-semibold mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2" data-testid={`blog-title-${post.id}`}>{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
