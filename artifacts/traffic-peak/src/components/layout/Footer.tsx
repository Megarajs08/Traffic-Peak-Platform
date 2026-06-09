import { Link } from "wouter";
import { Zap } from "lucide-react";

const productLinks = [
  { href: "/typing-test", label: "Typing Test" },
  { href: "/learn", label: "Learn to Type" },
  { href: "/games", label: "Typing Games" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/certificates", label: "Certificates" },
];

const blogCategories = [
  { href: "/blog?category=Typing+Tips", label: "Typing Tips" },
  { href: "/blog?category=Typing+Lessons", label: "Typing Lessons" },
  { href: "/blog?category=Productivity", label: "Productivity" },
  { href: "/blog?category=Keyboard+Guides", label: "Keyboard Guides" },
  { href: "/blog?category=Government+Exam+Preparation", label: "Govt Exam Prep" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/blog", label: "Blog" },
  { href: "/sitemap", label: "Sitemap" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/20 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span>Traffic<span className="text-primary">Peak</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The typing platform built for people who take their speed seriously. Practice, compete, and get certified.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Blog */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Blog</h3>
            <ul className="space-y-2">
              {blogCategories.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} TrafficPeak. All rights reserved.</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
