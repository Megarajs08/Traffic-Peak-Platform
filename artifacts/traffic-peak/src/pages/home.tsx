import { Link } from "wouter";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, MouseEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";
import { Zap, Target, BarChart2, Trophy, Users, BookOpen, ChevronDown, Gift } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Zero-Lag Typing Engine",
    description: "Character-level rendering with instant feedback. Every keystroke processed in real-time — no delays, no compromises.",
  },
  {
    icon: Target,
    title: "Precision Analytics",
    description: "Track WPM, CPM, accuracy, and error patterns. Understand exactly where you slow down.",
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    description: "Daily, weekly, and monthly charts that show your improvement over time. Set personal records.",
  },
  {
    icon: Trophy,
    title: "Global Leaderboard",
    description: "Compete with typists worldwide. Weekly and monthly rankings to keep the pressure on.",
  },
  {
    icon: BookOpen,
    title: "Structured Lessons",
    description: "From home row basics to code typing. Guided curriculum from beginner to advanced.",
  },
  {
    icon: Users,
    title: "Verified Certificates",
    description: "Generate shareable certificates for any test result. Unique certificate IDs for employer verification.",
  },
];

const stats = [
  { value: "150+", label: "WPM achieved" },
  { value: "99%", label: "Accuracy possible" },
  { value: "6", label: "Test modes" },
  { value: "5", label: "Timer options" },
];

const faqs = [
  {
    q: "How is WPM calculated?",
    a: "WPM (words per minute) is calculated as (correct characters / 5) divided by the elapsed time in minutes. This is the standard gross WPM calculation used across the industry.",
  },
  {
    q: "Are calculations done locally?",
    a: "Yes. All WPM, CPM, and accuracy calculations happen entirely in your browser. No API calls are made during the typing test — zero latency.",
  },
  {
    q: "How do certificates work?",
    a: "After completing any test, you can generate a certificate with your name, WPM, accuracy, date, and a unique certificate ID. Anyone can verify it at /verify-certificate.",
  },
  {
    q: "Is there a multiplayer mode?",
    a: "Yes — the Typing Race game lets you race against an AI opponent at configurable speeds. Real-time multiplayer is on the roadmap.",
  },
];

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TypingPeak Typing Test",
  applicationCategory: "EducationalApplication",
  description: "Free online typing speed test with real-time WPM, CPM, and accuracy tracking.",
  url: "https://typingpeak.vercel.app",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// â”€â”€ Animated typing demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEMO_PHRASES = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes perfect every single day",
  "speed comes with consistency and focus",
  "typing faster opens doors to opportunity",
];

type DemoCharState = "pending" | "correct" | "current";

interface DemoChar {
  char: string;
  state: DemoCharState;
}

function TypingDemo() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [chars, setChars] = useState<DemoChar[]>([]);
  const [cursorIdx, setCursorIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "clearing">("typing");

  // Build chars array whenever phrase changes
  useEffect(() => {
    const phrase = DEMO_PHRASES[phraseIdx];
    setChars(phrase.split("").map((c, i) => ({ char: c, state: i === 0 ? "current" : "pending" })));
    setCursorIdx(0);
    setPhase("typing");
  }, [phraseIdx]);

  useEffect(() => {
    if (chars.length === 0) return;

    if (phase === "typing") {
      if (cursorIdx >= chars.length) {
        // Finished typing — pause then clear
        const t = setTimeout(() => setPhase("pause"), 1400);
        return () => clearTimeout(t);
      }
      const delay = chars[cursorIdx]?.char === " " ? 60 : Math.random() * 55 + 55;
      const t = setTimeout(() => {
        setChars((prev) => {
          const next = [...prev];
          next[cursorIdx] = { ...next[cursorIdx], state: "correct" };
          if (cursorIdx + 1 < next.length)
            next[cursorIdx + 1] = { ...next[cursorIdx + 1], state: "current" };
          return next;
        });
        setCursorIdx((i) => i + 1);
      }, delay);
      return () => clearTimeout(t);
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("clearing"), 600);
      return () => clearTimeout(t);
    }

    if (phase === "clearing") {
      if (cursorIdx <= 0) {
        // Done clearing — move to next phrase
        const t = setTimeout(() => setPhraseIdx((i) => (i + 1) % DEMO_PHRASES.length), 300);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setChars((prev) => {
          const next = [...prev];
          const ci = cursorIdx - 1;
          next[ci] = { ...next[ci], state: "current" };
          if (cursorIdx < next.length)
            next[cursorIdx] = { ...next[cursorIdx], state: "pending" };
          return next;
        });
        setCursorIdx((i) => i - 1);
      }, 22);
      return () => clearTimeout(t);
    }
  }, [chars, cursorIdx, phase]);

  // wpm / accuracy counters — fake live numbers
  const progress = chars.length > 0 ? cursorIdx / chars.length : 0;
  const fakeWpm = Math.round(phase === "clearing" ? 0 : progress * 94);
  const fakeAcc = phase === "clearing" ? 100 : Math.round(96 + progress * 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto mt-10 rounded-2xl border border-border bg-card shadow-[0_8px_40px_hsl(213_94%_68%/0.1)] overflow-hidden select-none"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground tabular-nums">
          <span>
            <span className="text-foreground font-semibold">{fakeWpm}</span>
            <span className="ml-1">wpm</span>
          </span>
          <span>
            <span className="text-foreground font-semibold">{fakeAcc}</span>
            <span className="ml-1">acc</span>
          </span>
          <span className="text-primary font-semibold">60s</span>
        </div>
      </div>

      {/* Text area */}
      <div className="px-7 py-7 min-h-[88px] flex items-center">
        <p className="font-mono text-lg leading-relaxed tracking-wide break-words">
          {chars.map((c, i) => {
            const isCurrent = c.state === "current";
            const color =
              c.state === "correct"
                ? "text-foreground"
                : isCurrent
                ? "text-foreground/80"
                : "text-foreground/30";
            return (
              <span key={i} className={`relative ${color}`}>
                {isCurrent && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-[1px] top-[0.1em] w-[2px] h-[0.82em] rounded-sm bg-primary animate-pulse"
                  />
                )}
                {c.char}
              </span>
            );
          })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-border/40">
        <motion.div
          className="h-full bg-primary/60 rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.08 }}
        />
      </div>
    </motion.div>
  );
}

function FeatureCard({ feature, i }: { feature: typeof features[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glowBg = useTransform(
    [glowX, glowY],
    ([gx, gy]: number[]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, hsl(213 94% 68% / 0.12) 0%, transparent 65%)`
  );

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      key={feature.title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      viewport={{ once: true }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative p-6 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-colors overflow-hidden cursor-default"
      data-testid={`feature-card-${i}`}
    >
      {/* Dynamic glow highlight that follows the mouse */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: glowBg }}
      />
      {/* Content lifted in Z */}
      <div style={{ transform: "translateZ(18px)" }}>
        <feature.icon className="w-6 h-6 text-primary mb-4" />
        <h3 className="font-semibold mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="TypingPeak"
        description="Improve your typing speed and accuracy with real-time tests, structured lessons, typing games, global leaderboards, and verified certificates. Start free."
        structuredData={homeStructuredData}
        keywords="typing speed test, WPM test, typing practice online, learn to type, typing test free, keyboard speed"
      />
      <Navbar />

      {/* Voucher teaser banner */}
      <Link href="/weekly-voucher">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full cursor-pointer group"
          style={{ background: "linear-gradient(90deg, hsl(38 88% 52% / 0.10) 0%, hsl(38 88% 52% / 0.06) 100%)", borderBottom: "1px solid hsl(38 88% 52% / 0.18)" }}
        >
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
            <span className="text-base">🎁</span>
            <span className="text-sm font-medium" style={{ color: "hsl(38 88% 42%)" }}>
              Win weekly gift vouchers — top typists get rewarded every Sunday
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full group-hover:gap-2 transition-all"
              style={{ background: "hsl(38 88% 52% / 0.15)", color: "hsl(38 88% 42%)" }}>
              See how &rarr;
            </span>
          </div>
        </motion.div>
      </Link>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-28 text-center overflow-hidden">
        {/* 3D perspective grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(213 94% 68% / 0.04) 1px, transparent 1px),
              linear-gradient(90deg, hsl(213 94% 68% / 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            transform: "perspective(600px) rotateX(55deg) scaleY(1.8) translateY(10%)",
            maskImage: "linear-gradient(to top, transparent 0%, black 55%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%, transparent 100%)",
          }}
        />
        {/* Radial glow behind headline */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, hsl(213 94% 68% / 0.07) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative max-w-xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-5">
            typing speed platform
          </p>
          <h1
            className="font-typing text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
            data-testid="hero-headline"
            style={{
              textShadow: `
                0 1px 0 hsl(213 94% 50% / 0.4),
                0 2px 0 hsl(213 94% 40% / 0.3),
                0 3px 0 hsl(213 94% 30% / 0.2),
                0 4px 16px hsl(213 94% 68% / 0.15)
              `,
            }}
          >
            Type faster.<br />
            <span className="text-primary">Get better.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed" data-testid="hero-subheading">
            Practice, compete, learn, and get certified. The typing platform built for people who take their speed seriously.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center" data-testid="hero-cta">
            <Link href="/typing-test">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
                <Button size="lg" className="px-7 text-sm shadow-[0_4px_20px_hsl(213_94%_68%/0.25)]" data-testid="button-start-typing">
                  start typing
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        <TypingDemo />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/30"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.04 }}
                style={{ cursor: "default" }}
              >
                <div
                  className="text-3xl md:text-4xl font-extrabold text-primary"
                  data-testid={`stat-value-${i}`}
                  style={{
                    textShadow: "0 2px 12px hsl(213 94% 68% / 0.3)",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to type faster</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Built for serious typists who want real data, not just a practice tool.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-card/30 border-t border-border/50">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ x: 4 }}
                className="border border-border/60 rounded-lg p-5"
                data-testid={`faq-item-${i}`}
              >
                <h3 className="font-semibold mb-2 text-sm">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to hit your peak?</h2>
          <p className="text-muted-foreground mb-8">Jump in and take your first test — no account required.</p>
          <Link href="/typing-test">
            <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
              <Button
                size="lg"
                className="px-10 font-semibold shadow-[0_6px_32px_hsl(213_94%_68%/0.3)]"
                data-testid="button-cta-start"
              >
                Start Now, Free
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
