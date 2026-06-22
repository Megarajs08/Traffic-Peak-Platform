import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useVerifyCertificate, getVerifyCertificateQueryKey } from "@workspace/api-client-react";
import { Award, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyCertificate() {
  const [, params] = useRoute("/verify-certificate/:certificateId");
  const certId = params?.certificateId ?? "";

  const { data: cert, isLoading, isError } = useVerifyCertificate(certId, {
    query: { enabled: !!certId, queryKey: getVerifyCertificateQueryKey(certId) },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          {isLoading ? (
            <div className="text-muted-foreground">Verifying certificate...</div>
          ) : isError ? (
            <div data-testid="cert-invalid">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
              <p className="text-muted-foreground">No certificate with ID <code className="font-mono text-sm bg-muted px-1 rounded">{certId}</code> was found.</p>
            </div>
          ) : cert ? (
            <div
              className="bg-card border-2 border-primary/40 rounded-2xl p-10 shadow-lg"
              data-testid="cert-valid"
            >
              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-1">Valid Certificate</h1>
              <p className="text-muted-foreground text-sm mb-8">This certificate is authentic and verified by TypingPeak.</p>

              <div className="text-2xl font-bold mb-6" data-testid="cert-recipient">{cert.recipientName}</div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl p-4">
                  <div className="text-3xl font-extrabold text-primary font-mono" data-testid="cert-verified-wpm">{Math.round(cert.wpm)}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">WPM</div>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <div className="text-3xl font-extrabold font-mono">{Math.round(cert.accuracy)}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Accuracy</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Mode: <span className="font-mono capitalize">{cert.mode}</span></div>
                <div>Duration: <span className="font-mono">{cert.duration}s</span></div>
                <div>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                <div className="mt-3 font-mono text-xs bg-muted px-3 py-2 rounded-lg" data-testid="cert-id">{cert.certificateId}</div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
