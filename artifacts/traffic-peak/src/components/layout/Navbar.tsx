import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Moon, Sun, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/typing-test", label: "Type" },
  { href: "/learn", label: "Learn" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const logout = useLogout();

  function toggleDarkMode() {
    const root = document.documentElement.parentElement;
    const appRoot = document.getElementById("root")?.parentElement?.parentElement;
    // Toggle dark class on the wrapping div
    const wrapper = document.querySelector(".dark, .light");
    if (wrapper) {
      if (darkMode) {
        wrapper.classList.remove("dark");
        wrapper.classList.add("light");
      } else {
        wrapper.classList.remove("light");
        wrapper.classList.add("dark");
      }
    }
    setDarkMode(!darkMode);
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    });
  }

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight" data-testid="nav-logo">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-foreground">Traffic<span className="text-primary">Peak</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="button-theme-toggle"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="nav-dashboard">Dashboard</Button>
              </Link>
              <Link href={`/profile/${user?.username}`}>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary cursor-pointer" data-testid="nav-avatar">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="nav-login">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" data-testid="nav-register">Sign Up</Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/register" className="block px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
