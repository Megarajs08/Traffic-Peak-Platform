import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Gift, Flame, Star, Crown, Trophy } from "lucide-react";

const steps = [
  {
    icon: Flame,
    color: "hsl(4 80% 58%)",
    bg: "hsl(4 80% 58% / 0.08)",
    border: "hsl(4 80% 58% / 0.2)",
    step: "01",
    title: "Maintain your streak",
    desc: "Type at least once every day. Miss a day and your streak resets â€” consistency is the key to qualifying.",
  },
  {
    icon: Star,
    color: "hsl(38 88% 52%)",
    bg: "hsl(38 88% 52% / 0.08)",
    border: "hsl(38 88% 52% / 0.2)",
    step: "02",
    title: "Hit WPM milestones",
    desc: "Your leaderboard score is WPM x test count. Type fast, type often â€” both speed and frequency matter.",
  },
  {
    icon: Crown,
    color: "hsl(213 94% 68%)",
    bg: "hsl(213 94% 68% / 0.08)",
    border: "hsl(213 94% 68% / 0.2)",
    step: "03",
    title: "Win every Sunday",
    desc: "Top scorers at the weekly reset receive a gift voucher code directly in their inbox and on their dashboard.",
  },
];

const mockRows = [
  { rank: 1, name: "Arjun K.",   wpm: 138, streak: 21, score: "6,348", voucher: true  },
  { rank: 2, name: "Priya S.",   wpm: 124, streak: 14, score: "5,332", voucher: true  },
  { rank: 3, name: "Rahul M.",   wpm: 117, streak: 18, score: "4,914", voucher: true  },
  { rank: 4, name: "Divya R.",   wpm: 109, streak:  9, score: "3,924", voucher: false },
  { rank: 5, name: "Karthik B.", wpm:  98, streak:  7, score: "3,136", voucher: false },
];

export default function WeeklyVoucher() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Weekly Gift Vouchers â€” TypingPeak"
        description="Win real gift vouchers every week by maintaining your typing streak and climbing the TypingPeak leaderboard."
        keywords="typing reward, weekly voucher, typing leaderboard, streak reward"
      />
      <Navbar />

      <main className="flex-1 py-20 px-4 overflow-hidden relative">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 40% at 50% 0%, hsl(38 88% 52% / 0.07) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto max-w-4xl relative">

          {/* Hero heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ borderColor: "hsl(38 88% 52% / 0.3)", background: "hsl(38 88% 52% / 0.08)", color: "hsl(38 88% 42%)" }}>
              <Gift className="w-3.5 h-3.5" />
              Every Week
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Type well.{" "}
              <span style={{ color: "hsl(38 88% 48%)" }}>Win gift vouchers.</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
              Every week we reward the top typists on our leaderboard with real gift vouchers.
              Keep your streak alive and climb the ranks.
            </p>
          </motion.div>

          {/* 3-step cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-14">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="relative rounded-xl p-6 border"
                style={{ borderColor: item.border, background: item.bg }}
              >
                <span className="absolute top-4 right-5 text-[11px] font-bold tabular-nums opacity-20 select-none"
                  style={{ color: item.color }}>
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Leaderboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[0_8px_40px_hsl(38_88%_52%/0.08)] mb-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="text-sm font-semibold">This week's leaderboard</span>
              </div>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Resets Sunday
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {mockRows.map((row, i) => (
                <motion.div
                  key={row.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-4 px-6 py-3.5"
                >
                  <span className="w-6 text-center text-sm font-bold tabular-nums"
                    style={{ color: row.rank <= 3 ? "hsl(38 88% 52%)" : "hsl(var(--muted-foreground))" }}>
                    {row.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {row.name[0]}
                  </div>
                  <span className="flex-1 text-sm font-medium">{row.name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" style={{ color: "hsl(4 80% 58%)" }} />
                    {row.streak}d
                  </div>
                  <div className="text-xs text-muted-foreground w-14 text-right tabular-nums">
                    <span className="text-foreground font-semibold">{row.wpm}</span> wpm
                  </div>
                  <div className="text-xs text-muted-foreground w-16 text-right tabular-nums hidden sm:block">
                    {row.score} pts
                  </div>
                  <div className="w-20 flex justify-end">
                    {row.voucher ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "hsl(38 88% 52% / 0.12)", color: "hsl(38 88% 48%)", border: "1px solid hsl(38 88% 52% / 0.25)" }}>
                        <Gift className="w-2.5 h-2.5" />
                        Winner
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40">â€”</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/20">
              <p className="text-xs text-muted-foreground">Top 3 typists win a gift voucher every week</p>
              <Link href="/register">
                <Button size="sm" className="text-xs gap-1.5">
                  <Gift className="w-3 h-3" />
                  Join &amp; compete
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">Already have an account?</p>
            <div className="flex gap-3 justify-center">
              <Link href="/typing-test">
                <Button variant="outline" size="sm">Start typing now</Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="sm" className="gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  View leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
