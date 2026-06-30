import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";

export default function AssessmentResults() {
  return (
    <>
      <SEOMeta title="Assessment Results" description="Review candidate assessment outcomes." />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-lg">
          <h1 className="text-3xl font-semibold">Assessment Results</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Results will appear here when an assessment is completed.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
