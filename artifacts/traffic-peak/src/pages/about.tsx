import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";
import { Link } from "wouter";
import { Zap, Target, Users, Award, BookOpen, Globe } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Speed Without Compromise",
    description: "Every millisecond matters. Our typing engine is built for zero-lag character feedback, ensuring your practice reflects real-world performance.",
  },
  {
    icon: Target,
    title: "Accuracy-First Learning",
    description: "Speed follows accuracy. Our lessons and tests are designed to build muscle memory correctly from the start.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Compete on global leaderboards, share certificates, and challenge yourself alongside millions of typists worldwide.",
  },
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description: "From home row basics to advanced speed drills — a full curriculum that takes any beginner to expert level.",
  },
  {
    icon: Award,
    title: "Verified Achievements",
    description: "Every certificate carries a unique verification ID. Share your accomplishments with employers and peers with confidence.",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description: "Fully keyboard-navigable, screen-reader friendly, and mobile-responsive. Typing improvement should be available to everyone.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About TrafficPeak",
  description: "Learn about TrafficPeak's mission to help people improve their typing speed and accuracy.",
  url: "https://trafficpeak.replit.app/about",
  publisher: {
    "@type": "Organization",
    name: "TrafficPeak",
    url: "https://trafficpeak.replit.app",
    logo: {
      "@type": "ImageObject",
      url: "https://trafficpeak.replit.app/favicon.svg",
    },
  },
};

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="About Us"
        description="TrafficPeak is a professional typing platform built for people who take their speed seriously. Learn our mission, values, and the team behind the platform."
        structuredData={structuredData}
        keywords="about trafficpeak, typing platform, typing speed improvement, typing practice"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumb items={[{ label: "About Us" }]} />

        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-flex w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About TrafficPeak</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make everyone a faster, more accurate typist — because keyboard fluency
            is one of the highest-leverage skills in the modern world.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 bg-card/50 border border-border/60 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            TrafficPeak was built because every other typing platform felt either too casual or too clinical.
            We wanted something that took the craft seriously — zero input lag, real analytics, structured
            lessons that actually build skill, and certificates that carry real weight.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Typing speed directly impacts productivity, programming efficiency, writing output, and exam
            performance. Yet most people never deliberately practice it. TrafficPeak changes that.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you're aiming for 60 WPM for your first desk job, 120 WPM for competitive advantage,
            or preparing for a government typing exam, TrafficPeak has the tools, the curriculum, and the
            community to get you there.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card/40 border border-border/60 rounded-xl p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to hit your peak?</h2>
          <p className="text-muted-foreground mb-6">
            Start your first typing test right now — no account needed.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/typing-test" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
              Start Typing Test
            </Link>
            <Link href="/contact" className="border border-border px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-muted transition-colors">
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
