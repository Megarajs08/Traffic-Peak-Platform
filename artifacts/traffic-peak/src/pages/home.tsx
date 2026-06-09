import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";
import { Zap, Target, BarChart2, Trophy, Users, BookOpen, ChevronDown } from "lucide-react";

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
  name: "TrafficPeak Typing Test",
  applicationCategory: "EducationalApplication",
  description: "Free online typing speed test with real-time WPM, CPM, and accuracy tracking.",
  url: "https://trafficpeak.replit.app",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="TrafficPeak"
        description="Improve your typing speed and accuracy with real-time tests, structured lessons, typing games, global leaderboards, and verified certificates. Start free."
        structuredData={homeStructuredData}
        keywords="typing speed test, WPM test, typing practice online, learn to type, typing test free, keyboard speed"
      />
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Zero input lag guaranteed
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight" data-testid="hero-headline">
            Improve Your Typing<br />
            <span className="text-primary">Speed and Accuracy</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto" data-testid="hero-subheading">
            Practice, compete, learn, and get certified. The typing platform built for people who take their speed seriously.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center" data-testid="hero-cta">
            <Link href="/typing-test">
              <Button size="lg" className="px-8 text-base font-semibold" data-testid="button-start-typing">
                Start Typing Test
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="px-8 text-base font-semibold" data-testid="button-learn-to-type">
                Learn To Type
              </Button>
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/50"
        >
          <ChevronDown className="w-5 h-5 animate-bounce" />
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
              >
                <div className="text-3xl md:text-4xl font-extrabold text-primary" data-testid={`stat-value-${i}`}>{stat.value}</div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors"
                data-testid={`feature-card-${i}`}
              >
                <feature.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
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
            <Button size="lg" className="px-10 font-semibold" data-testid="button-cta-start">
              Start Now, Free
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
