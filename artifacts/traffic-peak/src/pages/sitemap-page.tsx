import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Main Pages",
    links: [
      { href: "/", label: "Home" },
      { href: "/typing-test", label: "Typing Test" },
      { href: "/learn", label: "Learn to Type" },
      { href: "/games", label: "Typing Games" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/certificates", label: "Certificates" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Blog Categories",
    links: [
      { href: "/blog?category=Typing+Tips", label: "Typing Tips" },
      { href: "/blog?category=Typing+Lessons", label: "Typing Lessons" },
      { href: "/blog?category=Productivity", label: "Productivity" },
      { href: "/blog?category=Keyboard+Guides", label: "Keyboard Guides" },
      { href: "/blog?category=Career+Skills", label: "Career Skills" },
      { href: "/blog?category=Government+Exam+Preparation", label: "Government Exam Preparation" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Sign Up" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/settings", label: "Settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/cookie-policy", label: "Cookie Policy" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Sitemap"
        description="Complete sitemap of TypingPeak â€” find all pages including typing tests, lessons, games, blog categories, and legal pages."
        keywords="sitemap, typingpeak pages"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumb items={[{ label: "Sitemap" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Sitemap</h1>
          <p className="text-muted-foreground">All pages on TypingPeak, organized by section.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-semibold text-sm text-primary uppercase tracking-wider mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-border group-hover:text-primary transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 bg-card/40 border border-border/60 rounded-xl text-sm text-muted-foreground">
          <p>
            Looking for the XML sitemap for search engines?{" "}
            <a href="/sitemap.xml" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              View sitemap.xml
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
