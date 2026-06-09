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

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta
        title="Disclaimer"
        description="Read TrafficPeak's disclaimer covering the accuracy of information, no warranties, external links, and limitations of liability."
        keywords="disclaimer, trafficpeak disclaimer, no warranty"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumb items={[{ label: "Disclaimer" }]} />

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <Section title="1. General Information">
            <p>
              The information provided by TrafficPeak on this website is for general informational and
              educational purposes only. All information is provided in good faith; however, we make no
              representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability,
              availability, or completeness of any information on the site.
            </p>
          </Section>

          <Section title="2. No Professional Advice">
            <p>
              Nothing on TrafficPeak constitutes professional advice of any kind — including but not limited
              to medical, ergonomic, employment, or career advice. Typing speed requirements for specific jobs
              or examinations vary by employer and jurisdiction. Always verify requirements directly with the
              relevant authority.
            </p>
          </Section>

          <Section title="3. Typing Scores and Certificates">
            <p>
              WPM, CPM, and accuracy scores displayed by TrafficPeak are calculated using standard industry
              formulas and reflect performance on our platform under the specific test conditions at the time
              of testing. These scores may not directly correspond to performance in other typing tests or
              real-world applications.
            </p>
            <p>
              Certificates issued by TrafficPeak are evidence of performance on our platform only. We do not
              guarantee their acceptance by employers, examination boards, government agencies, or any other
              third parties.
            </p>
          </Section>

          <Section title="4. External Links">
            <p>
              Our Service may contain links to external websites. These links are provided for convenience
              and information only. TrafficPeak has no control over the content or privacy practices of
              external sites and accepts no responsibility for them. The inclusion of a link does not imply
              endorsement.
            </p>
          </Section>

          <Section title="5. Blog Content">
            <p>
              Blog articles on TrafficPeak are written for informational purposes. Typing tips, productivity
              advice, and keyboard recommendations represent the opinions of their authors and are not
              guaranteed to be accurate, current, or complete. Readers should independently verify
              information before acting on it.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              Under no circumstances shall TrafficPeak, its operators, partners, or contributors be liable
              for any direct, indirect, incidental, consequential, special, or punitive damages arising
              from your use of or reliance upon this Service or any information contained herein.
            </p>
          </Section>

          <Section title="7. Availability">
            <p>
              TrafficPeak does not warrant that the Service will be available at any particular time or
              that the Service will be free from errors, viruses, or other harmful components. We reserve
              the right to modify or discontinue the Service at any time without notice.
            </p>
          </Section>

          <Section title="8. Governing Law">
            <p>
              This disclaimer is governed by applicable laws. If any provision of this disclaimer is found
              to be unenforceable, the remaining provisions will remain in full effect.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              For questions about this Disclaimer, please use our{" "}
              <a href="/contact" className="text-primary hover:underline">Contact page</a>.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
