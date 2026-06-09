import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import {
  useCreateHrAssessment,
  useUpdateHrAssessment,
  useGetHrAssessment,
  getGetHrAssessmentQueryKey,
  getListHrAssessmentsQueryKey,
  getGetHrDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

type FormState = {
  name: string;
  companyName: string;
  jobPosition: string;
  description: string;
  durationSeconds: number;
  difficulty: string;
  language: string;
  contentType: string;
  customText: string;
  passingWpm: number;
  minAccuracy: number;
  maxAttempts: number;
  active: boolean;
  expiresAt: string;
};

const DEFAULT: FormState = {
  name: "",
  companyName: "",
  jobPosition: "",
  description: "",
  durationSeconds: 300,
  difficulty: "medium",
  language: "english",
  contentType: "words",
  customText: "",
  passingWpm: 40,
  minAccuracy: 90,
  maxAttempts: 1,
  active: true,
  expiresAt: "",
};

const DURATIONS = [
  { label: "1 Minute", value: 60 },
  { label: "2 Minutes", value: 120 },
  { label: "5 Minutes", value: 300 },
  { label: "10 Minutes", value: 600 },
];

export default function AssessmentForm() {
  const [matchEdit, paramsEdit] = useRoute("/hr/assessments/:id/edit");
  const isEdit = matchEdit;
  const editId = isEdit ? parseInt(paramsEdit?.id ?? "0") : 0;

  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [saving, setSaving] = useState(false);

  const { data: existing } = useGetHrAssessment(editId, {
    query: { enabled: isEdit && editId > 0, queryKey: getGetHrAssessmentQueryKey(editId) },
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        companyName: existing.companyName,
        jobPosition: existing.jobPosition,
        description: existing.description ?? "",
        durationSeconds: existing.durationSeconds,
        difficulty: existing.difficulty ?? "medium",
        language: existing.language ?? "english",
        contentType: existing.contentType ?? "words",
        customText: existing.customText ?? "",
        passingWpm: existing.passingWpm ?? 40,
        minAccuracy: existing.minAccuracy,
        maxAttempts: existing.maxAttempts ?? 1,
        active: existing.active ?? true,
        expiresAt: existing.expiresAt ? existing.expiresAt.slice(0, 10) : "",
      });
    }
  }, [existing]);

  const { mutateAsync: create } = useCreateHrAssessment();
  const { mutateAsync: update } = useUpdateHrAssessment();

  function set(key: keyof FormState, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.companyName || !form.jobPosition) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        customText: form.customText || null,
        description: form.description || null,
      };
      if (isEdit) {
        await update({ id: editId, data: payload });
        toast({ title: "Assessment updated" });
      } else {
        const created = await create({ data: payload });
        toast({ title: "Assessment created!", description: `Share link: /assessment/${created.token}` });
        qc.invalidateQueries({ queryKey: getListHrAssessmentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetHrDashboardStatsQueryKey() });
        navigate(`/hr/assessments/${created.id}`);
        return;
      }
      qc.invalidateQueries({ queryKey: getListHrAssessmentsQueryKey() });
      navigate("/hr");
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center"><p className="text-muted-foreground mb-4">Please log in.</p>
          <Link href="/login"><Button>Login</Button></Link></div>
      </main><Footer /></div>
  );

  const title = isEdit ? "Edit Assessment" : "Create Assessment";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <Breadcrumb items={[{ label: "HR Panel", href: "/hr" }, { label: title }]} />
        <h1 className="text-2xl font-bold mb-8">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Assessment Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Data Entry Operator Screening" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Company Name <span className="text-red-400">*</span></label>
                <input value={form.companyName} onChange={e => set("companyName", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. ABC Technologies" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Job Position <span className="text-red-400">*</span></label>
                <input value={form.jobPosition} onChange={e => set("jobPosition", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Data Entry Operator" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Instructions shown to candidates…" />
            </div>
          </section>

          {/* Test Settings */}
          <section className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Test Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Duration</label>
                <select value={form.durationSeconds} onChange={e => set("durationSeconds", parseInt(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select value={form.language} onChange={e => set("language", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="tamil">Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Content Type</label>
                <select value={form.contentType} onChange={e => set("contentType", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="words">Random Words</option>
                  <option value="paragraphs">Paragraphs</option>
                  <option value="quotes">Quotes</option>
                  <option value="numbers">Numbers</option>
                  <option value="custom">Custom Text</option>
                </select>
              </div>
            </div>
            {form.contentType === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Custom Text</label>
                <textarea value={form.customText} onChange={e => set("customText", e.target.value)} rows={5}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Paste the text candidates will type…" />
              </div>
            )}
          </section>

          {/* Passing Criteria */}
          <section className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Passing Criteria</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Passing WPM</label>
                <input type="number" min={10} max={200} value={form.passingWpm} onChange={e => set("passingWpm", parseInt(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Min Accuracy (%)</label>
                <input type="number" min={50} max={100} value={form.minAccuracy} onChange={e => set("minAccuracy", parseFloat(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Attempts</label>
                <input type="number" min={1} max={10} value={form.maxAttempts} onChange={e => set("maxAttempts", parseInt(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Expiry Date (optional)</label>
                <input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-primary" : "bg-muted"}`}
                    onClick={() => set("active", !form.active)}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.active ? "left-6" : "left-1"}`} />
                  </div>
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
          </section>

          <div className="flex gap-3 justify-end">
            <Link href="/hr"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Assessment"}</Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
