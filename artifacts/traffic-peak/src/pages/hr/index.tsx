import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useGetHrDashboardStats, useListHrAssessments, getListHrAssessmentsQueryKey, getGetHrDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { BarChart2, Users, Target, TrendingUp, CheckCircle2, Plus, ChevronRight, Clipboard, Link2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteHrAssessment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-1">{sub}</div>}
    </div>
  );
}

export default function HrDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<number | null>(null);

  const { data: stats } = useGetHrDashboardStats({
    query: { queryKey: getGetHrDashboardStatsQueryKey() },
  });

  const { data: assessments = [], isLoading } = useListHrAssessments({
    query: { queryKey: getListHrAssessmentsQueryKey() },
  });

  const { mutate: deleteAssessment } = useDeleteHrAssessment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListHrAssessmentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetHrDashboardStatsQueryKey() });
        toast({ title: "Assessment deleted" });
        setDeleting(null);
      },
    },
  });

  function copyLink(token: string) {
    const url = `${window.location.origin}/assessment/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: url });
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please log in to access the HR panel.</p>
            <Link href="/login"><Button>Login</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">HR Assessment Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Create assessments, share links, and track candidates.</p>
          </div>
          <Link href="/hr/assessments/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Assessment</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={Clipboard} label="Total Assessments" value={stats?.totalAssessments ?? "—"} color="bg-blue-500/10 text-blue-400" />
          <StatCard icon={ToggleRight} label="Active" value={stats?.activeAssessments ?? "—"} color="bg-green-500/10 text-green-400" />
          <StatCard icon={Users} label="Candidates" value={stats?.totalCandidates ?? "—"} color="bg-purple-500/10 text-purple-400" />
          <StatCard icon={TrendingUp} label="Avg WPM" value={stats?.avgWpm ? `${stats.avgWpm}` : "—"} color="bg-orange-500/10 text-orange-400" />
          <StatCard icon={Target} label="Avg Accuracy" value={stats?.avgAccuracy ? `${stats.avgAccuracy}%` : "—"} color="bg-yellow-500/10 text-yellow-400" />
          <StatCard icon={CheckCircle2} label="Pass Rate" value={stats?.passRate !== undefined ? `${stats.passRate}%` : "—"} color="bg-teal-500/10 text-teal-400" />
        </div>

        {/* Assessments Table */}
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <h2 className="font-semibold">Your Assessments</h2>
            <Link href="/hr/assessments/new">
              <Button size="sm" variant="outline" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Create</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg" />)}
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <Clipboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No assessments yet</p>
              <p className="text-sm mb-4">Create your first assessment to start evaluating candidates.</p>
              <Link href="/hr/assessments/new"><Button>Create Assessment</Button></Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {assessments.map((a, i) => {
                const isExpired = a.expiresAt && new Date(a.expiresAt) < new Date();
                const passRate = (a.candidateCount ?? 0) > 0
                  ? Math.round(((a.passCount ?? 0) / (a.candidateCount ?? 1)) * 100)
                  : null;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">{a.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isExpired ? "bg-red-500/10 text-red-400" : a.active ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                          {isExpired ? "Expired" : a.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{a.companyName} · {a.jobPosition}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">
                        {Math.round(a.durationSeconds / 60)} min · {a.passingWpm} WPM · {a.minAccuracy}% acc required
                        {(a.candidateCount ?? 0) > 0 && ` · ${a.candidateCount} candidates · ${passRate}% pass`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyLink(a.token)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy shareable link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <Link href={`/hr/assessments/${a.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View results">
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/hr/assessments/${a.id}/edit`}>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                      {deleting === a.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteAssessment({ id: a.id })} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded">Confirm</button>
                          <button onClick={() => setDeleting(null)} className="text-xs text-muted-foreground px-2 py-1 rounded">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleting(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
