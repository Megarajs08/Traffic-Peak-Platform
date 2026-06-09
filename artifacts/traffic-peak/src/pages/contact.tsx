import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    detail: "support@trafficpeak.app",
    note: "For account & billing questions",
  },
  {
    icon: MessageSquare,
    title: "Feedback",
    detail: "Use the form below",
    note: "Feature requests & bug reports",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "Within 48 hours",
    note: "Monday to Friday",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact TrafficPeak",
  description: "Get in touch with the TrafficPeak team for support, feedback, or general inquiries.",
  url: "https://trafficpeak.replit.app/contact",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Contact Us"
        description="Get in touch with the TrafficPeak team. We're here to help with account questions, feedback, bug reports, and general inquiries."
        structuredData={structuredData}
        keywords="contact trafficpeak, typing platform support, help, feedback"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumb items={[{ label: "Contact Us" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">Have a question, suggestion, or found a bug? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, title, detail, note }) => (
              <div key={title} className="bg-card/40 border border-border/60 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{title}</div>
                    <div className="text-sm text-primary">{detail}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            ))}

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm">
              <p className="font-semibold mb-1">Community & bugs</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                For technical issues and feature discussions, the contact form is the fastest route to our team.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-card/40 border border-border/60 rounded-2xl h-full">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Thanks for reaching out. We'll get back to you within 48 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card/40 border border-border/60 rounded-2xl p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="" className="bg-background">Select a subject</option>
                    <option value="bug" className="bg-background">Bug Report</option>
                    <option value="feature" className="bg-background">Feature Request</option>
                    <option value="account" className="bg-background">Account Issue</option>
                    <option value="general" className="bg-background">General Inquiry</option>
                    <option value="other" className="bg-background">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your question or issue in detail..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground resize-none"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
