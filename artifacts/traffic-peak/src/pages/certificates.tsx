import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useListCertificates, useGenerateCertificate, useCheckCertificateEligibility } from "@workspace/api-client-react";
import { getListCertificatesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Certificates() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [testResultId, setTestResultId] = useState<number | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: certificates = [], isLoading, refetch } = useListCertificates({
    query: { enabled: isAuthenticated, queryKey: getListCertificatesQueryKey() },
  });

  const generateMutation = useGenerateCertificate();
  const checkEligibilityMutation = useCheckCertificateEligibility();

  // Check eligibility when test result is selected
  useEffect(() => {
    if (testResultId && !isChecking) {
      setIsChecking(true);
      checkEligibilityMutation.mutate(
        { body: { testResultId } },
        {
          onSuccess: (data) => {
            setEligibilityData(data);
            setIsEligible(data.eligible);
            setIsChecking(false);
          },
          onError: () => {
            setIsEligible(false);
            setIsChecking(false);
          },
        }
      );
    }
  }, [testResultId]);

  function handleGenerateCertificate() {
    if (!testResultId || !recipientName || !isEligible) return;

    generateMutation.mutate(
      { body: { testResultId, recipientName } },
      {
        onSuccess: () => {
          setShowGenerateModal(false);
          setTestResultId(null);
          setRecipientName("");
          refetch();
        },
      }
    );
  }

  function handleDownloadPDF(certificateId: string) {
    const downloadUrl = `/api/certificates/${certificateId}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `certificate-${certificateId}.pdf`;
    link.click();
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="certificates-heading">
            My Certificates
          </h1>
          <p className="text-muted-foreground">
            Certificates earned from completed typing tests.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div
            className="text-center py-20 bg-card border border-border rounded-xl"
            data-testid="empty-certificates"
          >
            <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Complete a typing test and generate your first certificate.
            </p>
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
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {cert.certificateId}
                  </span>
                </div>
                <h3
                  className="font-semibold mb-1"
                  data-testid={`cert-name-${cert.id}`}
                >
                  {cert.recipientName}
                </h3>
                <div className="flex items-center gap-4 my-4">
                  <div>
                    <div
                      className="text-2xl font-mono font-extrabold text-primary"
                      data-testid={`cert-wpm-${cert.id}`}
                    >
                      {Math.round(cert.wpm)}
                    </div>
                    <div className="text-xs text-muted-foreground">WPM</div>
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-extrabold">
                      {Math.round(cert.accuracy)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-sm font-mono">
                      {Math.round(cert.duration / 60)}m
                    </div>
                    <div className="text-xs text-muted-foreground">{cert.mode}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleDownloadPDF(cert.certificateId)}
                    data-testid={`button-download-cert-${cert.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                  <Link href={`/verify-certificate/${cert.certificateId}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5"
                      data-testid={`button-verify-cert-${cert.id}`}
                    >
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

      {/* Generate Certificate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Generate Certificate</h2>

            {/* Test Result Selection */}
            {!testResultId ? (
              <div className="space-y-3 mb-6">
                <p className="text-sm text-muted-foreground">Select a completed test:</p>
                {/* Recent test results - In real app, fetch from API */}
                <p className="text-xs text-muted-foreground py-2">
                  Test selection would go here (integrate with recent test results)
                </p>
                <Button
                  onClick={() => setTestResultId(0)} // Placeholder
                  className="w-full"
                >
                  Select Test
                </Button>
              </div>
            ) : isChecking ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Checking eligibility...</p>
              </div>
            ) : !isEligible ? (
              <div className="space-y-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-destructive">
                      Not Eligible Yet
                    </h3>
                    <div className="space-y-1 text-sm">
                      {eligibilityData?.reasons?.duration_failed && (
                        <div className="flex gap-2 items-center text-destructive/80">
                          <Clock className="w-4 h-4" />
                          <span>{eligibilityData.reasons.duration_failed}</span>
                        </div>
                      )}
                      {eligibilityData?.reasons?.wpm_failed && (
                        <div className="flex gap-2 items-center text-destructive/80">
                          <Zap className="w-4 h-4" />
                          <span>{eligibilityData.reasons.wpm_failed}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">✨ Eligible!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've met the requirements. Enter your name below.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This name will appear on your certificate
                  </p>
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-border">
                  <div className="text-center py-2">
                    <div className="text-lg font-bold text-primary">
                      {Math.round(eligibilityData?.stats?.wpm || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">WPM</div>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-lg font-bold">
                      {Math.round(eligibilityData?.stats?.accuracy || 0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerateModal(false);
                  setTestResultId(null);
                  setRecipientName("");
                  setEligibilityData(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              {isEligible && (
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={!recipientName || generateMutation.isPending}
                  className="flex-1"
                >
                  {generateMutation.isPending ? "Generating..." : "Generate"}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
