import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";

export default function ResetPassword() {
  return (
    <>
      <SEOMeta title="Reset Password" description="Set a new password for your TypingPeak account." />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 shadow-lg">
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Enter your new password below and confirm it to secure your account.
          </p>
          <form className="mt-8 space-y-6">
            <label className="block text-sm font-medium text-foreground">
              New password
              <input
                type="password"
                placeholder="New password"
                className="mt-2 w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Confirm new password
              <input
                type="password"
                placeholder="Confirm password"
                className="mt-2 w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Update password
            </button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Back to <Link href="/login" className="text-primary">Login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
