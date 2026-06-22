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

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Terms & Conditions"
        description="Read TypingPeak's Terms and Conditions governing your use of the typing platform, including user responsibilities, account rules, and limitations of liability."
        keywords="terms and conditions, terms of service, typingpeak terms"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumb items={[{ label: "Terms & Conditions" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using TypingPeak ("Service"), you agree to be bound by these Terms and
              Conditions ("Terms"). If you do not agree, you must not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              TypingPeak provides an online typing practice platform including typing tests, structured
              lessons, typing games, leaderboards, certificate generation, and educational blog content.
              Some features require account registration.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security of your password and account.</li>
              <li>Immediately notify us of any unauthorized account access.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
            </ul>
            <p>
              You must be at least 13 years old to create an account. By registering, you represent that you meet this requirement.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
              <li>Attempt to circumvent or manipulate leaderboard rankings or test scores.</li>
              <li>Use automated scripts, bots, or macros to generate artificial results.</li>
              <li>Impersonate any person or entity.</li>
              <li>Transmit any material that is harmful, offensive, or violates third-party rights.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service.</li>
            </ul>
          </Section>

          <Section title="5. Certificates">
            <p>
              Certificates generated through TypingPeak are based on test results recorded in our system.
              They are intended as personal achievement records. TypingPeak makes no guarantee that any
              employer, institution, or third party will accept or recognize these certificates. Generating
              a certificate with false information or attempting to tamper with certificate data is prohibited
              and may result in account termination.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content on the Service — including text, graphics, logos, software, and curricula — is
              owned by or licensed to TypingPeak and protected by applicable intellectual property laws.
              You may not reproduce, distribute, or create derivative works without prior written permission.
            </p>
            <p>
              By submitting content (such as a username or profile information), you grant TypingPeak a
              non-exclusive, royalty-free license to use that content for operating the Service.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>, which
              is incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, TYPINGPEAK DISCLAIMS ALL
              WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TYPINGPEAK SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
              OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR
              TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF $100 OR THE AMOUNTS PAID BY YOU IN THE
              TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these
              Terms. Upon termination, your right to use the Service ceases immediately. Provisions that
              by their nature should survive termination will do so.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the jurisdiction in which TypingPeak operates,
              without regard to conflict of law principles. Any disputes shall be resolved through
              binding arbitration or in competent courts of that jurisdiction.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may modify these Terms at any time. We will notify you of material changes by updating
              the "Last updated" date. Continued use of the Service after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions about these Terms, visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
