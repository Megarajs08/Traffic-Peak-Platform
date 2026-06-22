import { Link } from "wouter";

function TypingPeakLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <text
        x="0" y="28"
        fontFamily="'Inter', 'Glacial Indifference', sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="hsl(var(--foreground))"
        letterSpacing="-0.5"
      >typing</text>
      <rect x="88" y="14" width="32" height="19" rx="3" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" />
      <rect x="91" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="98" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="105" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="112" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="91" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="98" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="105" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="112" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="96" y="29" width="16" height="3" rx="1.5" fill="hsl(var(--primary))" opacity="0.6" />
      <text
        x="124" y="28"
        fontFamily="'Inter', 'Glacial Indifference', sans-serif"
        fontWeight="400"
        fontSize="22"
        fill="hsl(var(--primary))"
        letterSpacing="-0.3"
      >peak</text>
    </svg>
  );
}

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
    <footer className="border-t border-border/60 bg-background mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-base mb-4 hover:opacity-80 transition-opacity">
              <TypingPeakLogo className="h-8 w-auto" />
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
          <div>Â© {new Date().getFullYear()} TypingPeak. All rights reserved.</div>
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
