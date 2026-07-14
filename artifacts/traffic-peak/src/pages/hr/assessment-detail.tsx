import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
  useGetHrAssessment,
  getGetHrAssessmentQueryKey,
} from "@workspace/api-client-react";
import { CheckCircle2, XCircle, Copy, Download, Users, TrendingUp, Target, Clock, Search, ChevronUp, ChevronDown, Link2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

type SortKey = "rank" | "wpm" | "accuracy" | "completedAt";

function exportCSV(candidates: any[], name: string) {
  const headers = ["Rank", "Name", "Email", "Phone", "WPM", "Accuracy (%)", "Errors", "Status", "Tab Switches", "Completed At"];
  const rows = candidates.map(c => [
    c.rank, c.fullName, c.email, c.phone ?? "", c.wpm ?? 0, c.accuracy ? c.accuracy.toFixed(1) : 0,
    c.errorCount ?? 0, c.passed ? "Pass" : "Fail", c.tabSwitches ?? 0,
    c.completedAt ? new Date(c.completedAt).toLocaleString() : "-",
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name.replace(/\s+/g, "_")}_results.csv`;
  a.click();
}

export default function AssessmentDetail() {
  const [, params] = useRoute("/hr/assessments/:id");
  const id = parseInt(params?.id ?? "0");
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail">("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const { data, isLoading } = useGetHrAssessment(id, {
    query: { enabled: id > 0, queryKey: getGetHrAssessmentQueryKey(id) },
  });

  function copyLink() {
    if (!data) return;
    const url = `${window.location.origin}/assessment/${data.token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: url });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Link href="/login"><Button>Login to continue</Button></Link>
      </main><Footer /></div>
  );

  const candidates = (data?.candidates ?? []).filter(c => {
    const matchStatus = statusFilter === "all" || (statusFilter === "pass" ? c.passed : !c.passed);
    const matchSearch = !search || c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    let av = a[sortKey as keyof typeof a] ?? 0;
    let bv = b[sortKey as keyof typeof b] ?? 0;
    if (typeof av === "string") av = new Date(av).getTime();
    if (typeof bv === "string") bv = new Date(bv).getTime();
    return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const passCount = (data?.candidates ?? []).filter(c => c.passed).length;
  const total = data?.candidates?.length ?? 0;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;
  const avgWpm = total > 0
    ? Math.round((data?.candidates ?? []).reduce((s, c) => s + (c.wpm ?? 0), 0) / total)
    : 0;
  const expiresOn = data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : null;
  const validityLabel = data?.expiresAt
    ? `Expires on ${expiresOn}`
    : "No expiry set";

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <Breadcrumb items={[{ label: "HR Panel", href: "/hr" }, { label: data?.name ?? "Assessment" }]} />

        {isLoading ? (
          <div className="space-y-4"><div className="h-24 bg-muted animate-pulse rounded-xl" /><div className="h-64 bg-muted animate-pulse rounded-xl" /></div>
        ) : !data ? (
          <div className="text-center py-20 text-muted-foreground">Assessment not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">{data.name}</h1>
                <p className="text-muted-foreground text-sm">{data.companyName} | {data.jobPosition}</p>
                {data.description && <p className="text-sm text-muted-foreground/80 mt-1 max-w-xl">{data.description}</p>}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round(data.durationSeconds / 60)} min</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Pass: {data.passingWpm} WPM</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{data.minAccuracy}% accuracy</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{validityLabel}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${data.active ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {data.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={copyLink}>
                  <Link2 className="w-3.5 h-3.5" /> Copy Link
                </Button>
                <Link href={`/hr/assessments/${data.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
                {total > 0 && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportCSV(data.candidates ?? [], data.name)}>
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Users, label: "Total Candidates", value: total },
                { icon: CheckCircle2, label: "Passed", value: passCount, color: "text-green-400" },
                { icon: TrendingUp, label: "Pass Rate", value: `${passRate}%` },
                { icon: TrendingUp, label: "Avg WPM", value: avgWpm || "-" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Shareable Link */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Link2 className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Shareable assessment link</p>
                <p className="text-sm font-mono text-primary truncate">{window.location.origin}/assessment/{data.token}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={copyLink} className="shrink-0"><Copy className="w-3.5 h-3.5" /></Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-1.5">
                {(["all", "pass", "fail"] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Table */}
            {candidates.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-xl p-16 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No candidates yet</p>
                <p className="text-sm">Share the assessment link to start receiving submissions.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort("rank")}>Rank <SortIcon k="rank" /></th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Phone</th>
                      <th className="text-right px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort("wpm")}>WPM <SortIcon k="wpm" /></th>
                      <th className="text-right px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort("accuracy")}>Accuracy <SortIcon k="accuracy" /></th>
                      <th className="text-right px-4 py-3 hidden md:table-cell">Errors</th>
                      <th className="text-right px-4 py-3 hidden lg:table-cell">Tab Switches</th>
                      <th className="text-center px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{c.rank}</td>
                        <td className="px-4 py-3 font-medium">{c.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.phone ?? "-"}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">{c.wpm ?? "-"}</td>
                        <td className="px-4 py-3 text-right">{c.accuracy != null ? `${c.accuracy.toFixed(1)}%` : "-"}</td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">{c.errorCount ?? "-"}</td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          {(c.tabSwitches ?? 0) > 0
                            ? <span className="text-yellow-400">{c.tabSwitches}</span>
                            : <span className="text-muted-foreground">0</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.passed == null ? (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          ) : c.passed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
