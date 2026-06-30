import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLogout, useGetStatsSummary, getGetStatsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Menu, X, ShieldCheck, ChevronDown, Award, BadgeCheck, Gift, ClipboardList, Settings, Flame, Zap } from "lucide-react";

const toolLinks = [
  { href: "/certificates",       label: "Certificates",       icon: Award         },
  { href: "/verify-certificate", label: "Verify Certificate", icon: BadgeCheck    },
  { href: "/weekly-voucher",     label: "Weekly Voucher",     icon: Gift          },
  { href: "/hr",                 label: "HR Assessment",      icon: ClipboardList },
  { href: "/settings",           label: "Settings",           icon: Settings      },
];

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
      <g transform="translate(0 0)">
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
      </g>
      <text
        x="125" y="28"
        fontFamily="'Inter', 'Glacial Indifference', sans-serif"
        fontWeight="400"
        fontSize="22"
        fill="hsl(var(--primary))"
        letterSpacing="-0.3"
      >peak</text>
    </svg>
  );
}

const navLinks: { href: string; label: string; highlight?: boolean }[] = [
  { href: "/typing-test",  label: "Type"        },
  { href: "/games",        label: "Games"       },
  { href: "/leaderboard",  label: "Leaderboard" },
  { href: "/blog",         label: "Blog"        },
];

export function Navbar() {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [showFeatureBar, setShowFeatureBar] = useState(true);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const isAdmin = user?.role === "admin";
  const { data: summary } = useGetStatsSummary({
    query: {
      queryKey: getGetStatsSummaryQueryKey(),
      enabled: isAuthenticated,
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    },
  });

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        navigate("/");
      },
      onError: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        navigate("/");
      },
    });
  }

  const active = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  useEffect(() => {
    if (!toolsOpen) return;

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (toolsMenuRef.current && target && !toolsMenuRef.current.contains(target)) {
        setToolsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [toolsOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          data-testid="nav-logo"
        >
          <TypingPeakLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? `px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-100 ${
                      active(link.href) ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
                    }`
                  : `px-3 py-1.5 rounded-full text-sm transition-colors duration-100 ${
                      active(link.href)
                        ? "bg-primary text-white font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`
              }
              data-testid={`nav-link-${link.label}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors duration-100 ${
                toolsOpen
                  ? "bg-primary text-white font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-lg py-1 z-50">
                {toolLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setToolsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      active(href) ? "text-primary font-medium bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 md:ml-6">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            title={isAuthenticated ? "Your current streak and highest WPM" : "Login to track your streak and highest WPM"}
            className="hidden md:flex items-center gap-3 mr-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-semibold text-foreground">{summary?.currentStreak ?? 0}</span>
              <span>streak</span>
            </span>
            <span className="h-3 w-px bg-border/70" />
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">{Math.round(summary?.bestWpm ?? 0)}</span>
              <span>best wpm</span>
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground" data-testid="nav-admin">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm" data-testid="nav-dashboard">
                  Dashboard
                </Button>
              </Link>
              <Link href={`/profile/${user?.username}`}>
                <div
                  className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary cursor-pointer hover:bg-primary/25 transition-colors"
                  data-testid="nav-avatar"
                >
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground text-sm"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm" data-testid="nav-login">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm" data-testid="nav-register">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            data-testid="button-mobile-menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showFeatureBar && (
        <div className="border-t border-border/50 bg-muted/35">
          <div className="mx-auto max-w-5xl px-5 h-10 flex items-center justify-center relative text-sm">
            <div className="inline-flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D4A017]/45 bg-[#D4A017]/14 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B8860B] shrink-0">
                <Gift className="h-3 w-3" />
                Gift Rewards
              </span>
              <span className="hidden md:inline text-muted-foreground">
                Win weekly gift vouchers - top typists get rewarded every Sunday
              </span>
              <Link href="/weekly-voucher" className="text-primary text-xs font-semibold hover:underline underline-offset-4 shrink-0">
                See how &rarr;
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowFeatureBar(false)}
              className="absolute right-5 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
              aria-label="Close announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-5 py-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? `block px-3 py-2 rounded text-sm font-semibold transition-colors ${
                      active(link.href) ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
                    }`
                  : `block px-3 py-2 rounded text-sm transition-colors ${
                      active(link.href) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Tools section in mobile */}
          <div className="border-t border-border/50 pt-2 mt-2">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
            {toolLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  active(href) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-border/50 pt-2 mt-2">
            <Link href="/about" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>Contact</Link>
          </div>

          {isAuthenticated ? (
            <div className="border-t border-border/50 pt-2 mt-2">
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded text-sm text-primary" onClick={() => setOpen(false)}>Admin Panel</Link>
              )}
              <Link href="/dashboard" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40">Logout</button>
            </div>
          ) : (
            <div className="border-t border-border/50 pt-2 mt-2 flex flex-col gap-1">
              <Link href="/login" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="block px-3 py-2 rounded text-sm text-primary font-medium" onClick={() => setOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
