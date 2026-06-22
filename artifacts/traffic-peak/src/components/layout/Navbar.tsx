import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Menu, X, ShieldCheck } from "lucide-react";

function TypingPeakLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* "typing" â€” bold, foreground color */}
      <text
        x="0" y="28"
        fontFamily="'Inter', 'Glacial Indifference', sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="hsl(var(--foreground))"
        letterSpacing="-0.5"
      >typing</text>

      {/* Keyboard icon between the words */}
      {/* Body */}
      <rect x="88" y="14" width="32" height="19" rx="3" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" />
      {/* Key row 1 â€” 4 small keys */}
      <rect x="91" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="98" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="105" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="112" y="17" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
      {/* Key row 2 â€” 3 keys offset */}
      <rect x="91" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="98" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="105" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      <rect x="112" y="23" width="5" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.5" />
      {/* Spacebar */}
      <rect x="96" y="29" width="16" height="3" rx="1.5" fill="hsl(var(--primary))" opacity="0.6" />

      {/* "peak" â€” regular weight, primary color */}
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

const navLinks = [
  { href: "/typing-test",         label: "type"        },
  { href: "/learn",               label: "learn"       },
  { href: "/games",               label: "games"       },
  { href: "/leaderboard",         label: "leaderboard" },
  { href: "/blog",                label: "blog"        },
];

export function Navbar() {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const isAdmin = user?.role === "admin";

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        // Remove cached user immediately so UI updates at once
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        navigate("/");
      },
      onError: () => {
        // Even on network error, clear local state and redirect
        queryClient.setQueryData(getGetMeQueryKey(), null);
        navigate("/");
      },
    });
  }

  const active = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <header className="border-b border-border/60 bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          data-testid="nav-logo"
        >
          <TypingPeakLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors duration-100 ${
                active(link.href)
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-link-${link.label}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground" data-testid="nav-admin">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm" data-testid="nav-dashboard">
                  dashboard
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
                logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm" data-testid="nav-login">
                  login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm" data-testid="nav-register">
                  sign up
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-5 py-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                active(link.href)
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border/50 pt-2 mt-2">
            <Link href="/about"   className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>about</Link>
            <Link href="/contact" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>contact</Link>
          </div>
          {isAuthenticated ? (
            <div className="border-t border-border/50 pt-2 mt-2">
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded text-sm text-primary" onClick={() => setOpen(false)}>admin panel</Link>
              )}
              <Link href="/dashboard" className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40">logout</button>
            </div>
          ) : (
            <div className="border-t border-border/50 pt-2 mt-2 flex flex-col gap-1">
              <Link href="/login"    className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40" onClick={() => setOpen(false)}>login</Link>
              <Link href="/register" className="block px-3 py-2 rounded text-sm text-primary font-medium" onClick={() => setOpen(false)}>sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
