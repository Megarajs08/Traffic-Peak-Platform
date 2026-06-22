import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useListCertificates } from "@workspace/api-client-react";
import { getListCertificatesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Certificates() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: certificates = [], isLoading } = useListCertificates({
    query: { enabled: isAuthenticated, queryKey: getListCertificatesQueryKey() },
  });

  function handleDownload(cert: typeof certificates[0]) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 1200, 800);

    // Border
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 1140, 740);

    // Title
    ctx.fillStyle = "#2563EB";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TYPING PEAK", 600, 100);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px Inter, sans-serif";
    ctx.fillText("Certificate of Typing Achievement", 600, 140);

    // Recipient
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText(cert.recipientName, 600, 300);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px Inter, sans-serif";
    ctx.fillText("has demonstrated exceptional typing speed and accuracy", 600, 360);

    // Stats
    ctx.fillStyle = "#2563EB";
    ctx.font = "bold 64px Inter, sans-serif";
    ctx.fillText(`${Math.round(cert.wpm)} WPM`, 400, 470);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 64px Inter, sans-serif";
    ctx.fillText(`${Math.round(cert.accuracy)}%`, 850, 470);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px Inter, sans-serif";
    ctx.fillText("Words Per Minute", 400, 510);
    ctx.fillText("Accuracy", 850, 510);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "14px monospace";
    ctx.fillText(`Certificate ID: ${cert.certificateId}`, 600, 640);
    ctx.fillText(`Issued: ${new Date(cert.issuedAt).toLocaleDateString()}`, 600, 670);
    ctx.fillText(`Verify at: typingpeak.app/verify-certificate/${cert.certificateId}`, 600, 700);

    const link = document.createElement("a");
    link.download = `certificate-${cert.certificateId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="certificates-heading">My Certificates</h1>
          <p className="text-muted-foreground">Certificates earned from completed typing tests.</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl" data-testid="empty-certificates">
            <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Complete a typing test and generate your first certificate.</p>
            <Link href="/typing-test">
              <Button data-testid="button-start-typing-certs">Take a Test</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                data-testid={`cert-card-${cert.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{cert.certificateId}</span>
                </div>
                <h3 className="font-semibold mb-1" data-testid={`cert-name-${cert.id}`}>{cert.recipientName}</h3>
                <div className="flex items-center gap-4 my-4">
                  <div>
                    <div className="text-2xl font-mono font-extrabold text-primary" data-testid={`cert-wpm-${cert.id}`}>{Math.round(cert.wpm)}</div>
                    <div className="text-xs text-muted-foreground">WPM</div>
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-extrabold">{Math.round(cert.accuracy)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-sm font-mono">{cert.duration}s</div>
                    <div className="text-xs text-muted-foreground">{cert.mode}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-4">{new Date(cert.issuedAt).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleDownload(cert)} data-testid={`button-download-cert-${cert.id}`}>
                    <Download className="w-3.5 h-3.5" />
                    PNG
                  </Button>
                  <Link href={`/verify-certificate/${cert.certificateId}`}>
                    <Button size="sm" variant="ghost" className="gap-1.5" data-testid={`button-verify-cert-${cert.id}`}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
