import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SEOMeta } from "@/components/SEOMeta";

const LAST_UPDATED = "June 9, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function CookieTable({ rows }: { rows: { name: string; type: string; purpose: string; duration: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Purpose</th>
            <th className="text-left px-4 py-3 font-semibold text-foreground">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.name}</td>
              <td className="px-4 py-3">{row.type}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Cookie Policy"
        description="TypingPeak's Cookie Policy explains what cookies we use, why we use them, and how you can control them."
        keywords="cookie policy, cookies, typingpeak cookies, privacy"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumb items={[{ label: "Cookie Policy" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device when you visit a website. They help websites
              remember your preferences, keep you logged in, and understand how users interact with the site.
            </p>
          </Section>

          <Section title="2. How We Use Cookies">
            <p>
              TypingPeak uses cookies in the following categories:
            </p>
            <p><strong className="text-foreground">Essential Cookies</strong> â€” required for the Service to function. You cannot opt out of these.</p>
            <CookieTable
              rows={[
                {
                  name: "tp_session",
                  type: "Essential",
                  purpose: "Keeps you logged in across page visits. HttpOnly â€” inaccessible to JavaScript.",
                  duration: "30 days",
                },
                {
                  name: "tp_cookie_consent",
                  type: "Essential",
                  purpose: "Stores your cookie consent preference (localStorage, not a cookie).",
                  duration: "Persistent",
                },
              ]}
            />
            <p><strong className="text-foreground">Analytics Cookies</strong> â€” used to understand site usage. Only set with your consent.</p>
            <CookieTable
              rows={[
                {
                  name: "_ga, _gid",
                  type: "Analytics",
                  purpose: "Google Analytics â€” measures traffic, pages visited, and time on site. Set only with consent.",
                  duration: "Up to 2 years",
                },
              ]}
            />
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>
              When you accept analytics cookies, Google Analytics may set cookies on your device. These
              are governed by Google's Privacy Policy. We do not use advertising or tracking cookies
              that follow you across other websites.
            </p>
          </Section>

          <Section title="4. Your Choices">
            <p>
              When you first visit TypingPeak, a cookie consent banner will appear. You can:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Accept All</strong> â€” enables essential and analytics cookies.</li>
              <li><strong className="text-foreground">Essential Only</strong> â€” enables only cookies required for the Service to function.</li>
            </ul>
            <p>
              You can clear your cookie preference at any time by clearing your browser's localStorage
              (key: <code className="text-primary bg-muted px-1 py-0.5 rounded text-xs">tp_cookie_consent</code>) or clearing all site data.
            </p>
          </Section>

          <Section title="5. Browser Controls">
            <p>
              You can also control cookies directly through your browser settings. Most browsers allow
              you to view, block, or delete cookies. Note that blocking essential cookies will prevent
              you from staying logged in. Refer to your browser's help documentation for instructions.
            </p>
          </Section>

          <Section title="6. Do Not Track">
            <p>
              TypingPeak respects "Do Not Track" browser signals. If your browser sends a DNT header,
              we will not set analytics cookies regardless of your consent choice.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time. Changes are effective immediately upon
              posting. Continued use of the Service after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              For questions about cookies, visit our{" "}
              <a href="/contact" className="text-primary hover:underline">Contact page</a> or see our{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
