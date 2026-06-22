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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Privacy Policy"
        description="TypingPeak's Privacy Policy explains how we collect, use, and protect your personal information when you use our typing platform."
        keywords="privacy policy, data protection, typingpeak privacy"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <Section title="1. Introduction">
            <p>
              TypingPeak ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website
              at typingpeak.replit.app (the "Service").
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-foreground">Information you provide directly:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account registration data: email address, username, and password (stored as a secure hash).</li>
              <li>Profile information: display name and avatar URL (optional).</li>
              <li>Contact form submissions: name, email, and message content.</li>
            </ul>
            <p><strong className="text-foreground">Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Typing test results: WPM, CPM, accuracy, error count, test mode, and duration.</li>
              <li>Lesson progress: completion status, scores per lesson.</li>
              <li>Session data: stored in an httpOnly cookie for authentication.</li>
              <li>Usage data: pages visited, features used (via analytics cookies, with your consent).</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain the Service.</li>
              <li>Create and manage your account.</li>
              <li>Display your typing statistics, progress, and leaderboard rankings.</li>
              <li>Generate and verify certificates.</li>
              <li>Respond to support requests and feedback.</li>
              <li>Improve the Service through aggregated analytics.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. Cookies">
            <p>
              We use cookies to authenticate your session and, with your consent, to collect analytics data.
              Our session cookie (<code className="text-primary bg-muted px-1 py-0.5 rounded text-xs">tp_session</code>) is httpOnly and essential
              for login functionality. See our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for full details.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>
              We do not sell, trade, or rent your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Service providers:</strong> Replit, Inc. (hosting infrastructure) who are bound by data processing agreements.</li>
              <li><strong className="text-foreground">Legal requirements:</strong> When required by law, court order, or government authority.</li>
              <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
            <p>
              Leaderboard data (username and typing scores) is publicly visible by design. You can delete
              your account at any time to remove this data.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Typing test results and
              certificates are retained to maintain your history and enable verification. You may request
              deletion of your account and associated data by contacting us.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data ("right to be forgotten").</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Data portability.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="/contact" className="text-primary hover:underline">our contact page</a>.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement industry-standard security measures including bcrypt password hashing, httpOnly
              session cookies, HTTPS-only transmission, and server-side input validation. No method of
              transmission over the internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us information, please contact
              us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes by
              updating the "Last updated" date. Continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For privacy-related inquiries, please use our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
