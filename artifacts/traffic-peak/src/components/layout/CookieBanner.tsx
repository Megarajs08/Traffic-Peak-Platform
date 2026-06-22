import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tp_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Cookie className="w-4 h-4 text-primary" />
            We use cookies
          </div>
          <button
            onClick={decline}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          We use essential cookies to keep you logged in and analytics cookies to improve our service. Read our{" "}
          <Link href="/cookie-policy" className="text-primary hover:underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} className="flex-1 text-xs">
            Accept All
          </Button>
          <Button size="sm" variant="outline" onClick={decline} className="flex-1 text-xs">
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
}
