import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle, Clock, Shield, Eye, Keyboard } from "lucide-react";

// â”€â”€ Word lists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WORDS_EN = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "know", "take",
  "people", "year", "your", "good", "some", "could", "them", "see",
  "other", "than", "then", "now", "look", "come", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well",
  "way", "even", "new", "want", "because", "any", "these", "give",
  "day", "most", "us", "great", "between", "large", "often", "hand",
  "high", "place", "hold", "turn", "help", "much", "before", "line",
  "right", "move", "play", "small", "number", "off", "always", "both",
  "never", "sound", "point", "city", "end", "still", "learn", "plant",
  "cover", "food", "sun", "four", "between", "state", "keep", "eye",
  "never", "last", "let", "thought", "head", "under", "story", "saw",
  "left", "few", "while", "along", "might", "close", "something", "seem",
  "next", "hard", "open", "example", "begin", "life", "always", "those",
  "both", "paper", "together", "got", "group", "often", "run", "important",
];

const NUMBERS_CHARS = "0123456789 ";

function generateText(contentType: string, customText: string | null, count = 120): string {
  if (contentType === "custom" && customText) return customText;
  if (contentType === "numbers") {
    let s = "";
    for (let i = 0; i < count; i++) s += Math.floor(Math.random() * 10);
    return s.match(/.{1,6}/g)?.join(" ") ?? s;
  }
  const pool = WORDS_EN;
  const picked: string[] = [];
  while (picked.length < count) picked.push(pool[Math.floor(Math.random() * pool.length)]);
  return picked.join(" ");
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Phase = "loading" | "intake" | "instructions" | "test" | "result" | "error";

type AssessmentInfo = {
  id: number;
  token: string;
  name: string;
  companyName: string;
  jobPosition: string;
  description: string | null;
  durationSeconds: number;
  difficulty: string;
  contentType: string;
  customText: string | null;
  passingWpm: number;
  minAccuracy: number;
  maxAttempts: number;
};

type StartResult = {
  candidateId: number;
  assessmentId: number;
  durationSeconds: number;
  contentType: string;
  customText: string | null;
  passingWpm: number;
  minAccuracy: number;
};

type SubmitResult = {
  id: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  errorCount: number;
  passed: boolean;
  passingWpm: number;
  minAccuracy: number;
  companyName: string;
  jobPosition: string;
};

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CandidateAssessment() {
  const [, params] = useRoute("/assessment/:token");
  const token = params?.token ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<AssessmentInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Intake form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Test state
  const [candidateSession, setCandidateSession] = useState<StartResult | null>(null);
  const [testText, setTestText] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [autoSubmitWarning, setAutoSubmitWarning] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tabSwitchesRef = useRef(0);

  // â”€â”€ Load assessment info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!token) return;
    fetch(`/api/assessment/${token}`)
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.error)))
      .then((data: AssessmentInfo) => { setInfo(data); setPhase("intake"); })
      .catch((msg: string) => { setErrorMsg(msg ?? "Assessment not found"); setPhase("error"); });
  }, [token]);

  // â”€â”€ Anti-cheat: tab switch detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (phase !== "test" || testEnded) return;

    function onVisibilityChange() {
      if (document.hidden && testStarted) {
        const next = tabSwitchesRef.current + 1;
        tabSwitchesRef.current = next;
        setTabSwitches(next);
        const newWarnings = Math.min(next, 3);
        setTabWarnings(newWarnings);
        if (next >= 3) {
          setAutoSubmitWarning(true);
          setTimeout(() => handleAutoSubmit(), 4000);
        }
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [phase, testStarted, testEnded]);

  // â”€â”€ Timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!testStarted || testEnded || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTestEnded(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testStarted, testEnded]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (testEnded && !submitting && !submitResult && candidateSession) {
      doSubmit();
    }
  }, [testEnded]);

  // â”€â”€ Calculate stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function calcStats() {
    if (!candidateSession) return { wpm: 0, cpm: 0, accuracy: 0, errorCount: 0, charCount: 0 };
    const duration = (candidateSession.durationSeconds - timeLeft);
    const words = typed.trim().split(/\s+/).filter(Boolean);
    const targetWords = testText.split(" ");
    let errors = 0;

    for (let i = 0; i < typed.length; i++) {
      if (i >= testText.length || typed[i] !== testText[i]) errors++;
    }

    const correctChars = typed.length - errors;
    const minutes = Math.max(duration / 60, 1 / 60);
    const wpm = Math.round(Math.max(0, (correctChars / 5) / minutes));
    const cpm = Math.round(Math.max(0, correctChars / minutes));
    const accuracy = typed.length > 0 ? Math.max(0, Math.round(((typed.length - errors) / typed.length) * 100 * 10) / 10) : 0;

    return { wpm, cpm, accuracy, errorCount: errors, charCount: typed.length };
  }

  async function doSubmit() {
    if (submitting || !candidateSession) return;
    setSubmitting(true);
    const stats = calcStats();
    try {
      const res = await fetch(`/api/assessment/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...stats, candidateId: candidateSession.candidateId, tabSwitches: tabSwitchesRef.current, durationSeconds: candidateSession.durationSeconds }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const data: SubmitResult = await res.json();
      setSubmitResult(data);
      setPhase("result");
    } catch {
      setErrorMsg("Failed to submit results. Please contact the recruiter.");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAutoSubmit() {
    setTestEnded(true);
    setAutoSubmitWarning(false);
  }

  // â”€â”€ Start test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleStart() {
    if (!fullName.trim() || !email.trim()) return;
    try {
      const res = await fetch(`/api/assessment/${token}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.toLowerCase().trim(), phone: phone.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      setCandidateSession(data);
      const text = generateText(data.contentType, data.customText);
      setTestText(text);
      setTimeLeft(data.durationSeconds);
      setPhase("instructions");
    } catch (e: any) {
      setErrorMsg(e.message ?? "Failed to start assessment");
    }
  }

  function beginTest() {
    setPhase("test");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") e.preventDefault();
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (testEnded) return;
    const val = e.target.value;
    if (!testStarted && val.length > 0) setTestStarted(true);
    if (val.length <= testText.length) setTyped(val);
    if (val.length === testText.length) {
      setTestEnded(true);
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "loading") return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading assessmentâ€¦</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (phase === "error") return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Assessment Unavailable</h1>
          <p className="text-muted-foreground text-sm">{errorMsg}</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  // â”€â”€ Intake Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "intake") return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Keyboard className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{info?.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{info?.companyName} Â· {info?.jobPosition}</p>
            {info?.description && <p className="text-sm text-muted-foreground/80 mt-3 max-w-sm mx-auto">{info.description}</p>}
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Your Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+91 98765 43210" />
            </div>
            <Button className="w-full mt-2" onClick={handleStart} disabled={!fullName.trim() || !email.trim()}>
              Continue
            </Button>
          </div>

          <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span>{Math.round((info?.durationSeconds ?? 300) / 60)} min test</span>
            <span>{info?.passingWpm} WPM required</span>
            <span>{info?.minAccuracy}% accuracy</span>
          </div>

          {errorMsg && <p className="text-red-400 text-sm text-center mt-3">{errorMsg}</p>}
        </motion.div>
      </main>
      <Footer />
    </div>
  );

  // â”€â”€ Instructions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "instructions") return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Before You Begin</h1>
            <p className="text-muted-foreground text-sm">Read these instructions carefully.</p>
          </div>

          <div className="bg-card border border-border/60 rounded-xl divide-y divide-border/40 mb-6">
            {[
              ["Timer", `You have ${Math.round((candidateSession?.durationSeconds ?? 300) / 60)} minutes. The test ends automatically when the timer runs out or you type all the text.`],
              ["Anti-Cheat", "Do NOT switch tabs or minimize the window. You will receive a warning for each tab switch. After 3 warnings, the test is auto-submitted."],
              ["Copy-Paste", "Pasting text is disabled. Type everything manually."],
              ["Accuracy", `You need at least ${candidateSession?.minAccuracy}% accuracy and ${candidateSession?.passingWpm} WPM to pass.`],
              ["Submission", "Once you complete typing or the timer ends, your results are submitted automatically."],
            ].map(([title, desc]) => (
              <div key={title} className="px-5 py-4">
                <p className="text-sm font-medium mb-0.5">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={beginTest}>
            I Understand â€” Start Test
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );

  // â”€â”€ Test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "test") {
    const chars = testText.split("");
    const pct = typed.length / testText.length;
    const elapsed = (candidateSession?.durationSeconds ?? 300) - timeLeft;
    const minutes = Math.max(elapsed / 60, 1 / 60);
    let errors = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== testText[i]) errors++;
    }
    const correctChars = typed.length - errors;
    const liveWpm = Math.round(Math.max(0, (correctChars / 5) / minutes));

    return (
      <div
        className="min-h-screen flex flex-col select-none"
        onContextMenu={e => e.preventDefault()}
      >
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          {/* Tab warning banner */}
          <AnimatePresence>
            {tabWarnings > 0 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${tabWarnings >= 3 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">
                  {autoSubmitWarning
                    ? "3 tab switches detected. Auto-submitting in 4 secondsâ€¦"
                    : `Warning ${tabWarnings}/3: Do not switch tabs! Next switch will auto-submit.`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6 bg-card border border-border/60 rounded-xl px-5 py-3">
            <div className="text-center">
              <div className={`text-xl font-bold font-mono ${timeLeft <= 30 ? "text-red-400" : ""}`}>{formatTime(timeLeft)}</div>
              <div className="text-xs text-muted-foreground">time left</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono">{testStarted ? liveWpm : "â€”"}</div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono">{testStarted ? `${errors}` : "â€”"}</div>
              <div className="text-xs text-muted-foreground">errors</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono">{Math.round(pct * 100)}%</div>
              <div className="text-xs text-muted-foreground">progress</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <motion.div className="h-full bg-primary" style={{ width: `${pct * 100}%` }} />
          </div>

          {/* Text display */}
          <div className="bg-card border border-border/60 rounded-xl p-6 mb-4 font-mono text-base leading-loose relative select-none">
            {chars.map((ch, i) => {
              let cls = "text-muted-foreground/40";
              if (i < typed.length) {
                cls = typed[i] === ch ? "text-foreground" : "bg-red-500/30 text-red-300 rounded";
              } else if (i === typed.length) {
                cls = "border-l-2 border-primary text-muted-foreground/40";
              }
              return <span key={i} className={cls}>{ch}</span>;
            })}
          </div>

          {/* Hidden textarea */}
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={e => e.preventDefault()}
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
            disabled={testEnded}
            className="absolute opacity-0 w-1 h-1 pointer-events-none"
            autoFocus
            aria-label="Type here"
          />

          {/* Click to focus */}
          <div
            className="mt-2 text-center text-xs text-muted-foreground cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          >
            Click here if the test stops responding Â· Tab disabled
          </div>

          {/* Submit button */}
          {testStarted && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setTestEnded(true)} disabled={submitting}>
                {submitting ? "Submittingâ€¦" : "Submit Early"}
              </Button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // â”€â”€ Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "result" && submitResult) {
    const passed = submitResult.passed;
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {passed
                ? <CheckCircle2 className="w-10 h-10 text-green-400" />
                : <XCircle className="w-10 h-10 text-red-400" />}
            </div>

            <h1 className="text-3xl font-bold mb-2">{passed ? "Congratulations!" : "Keep Practicing"}</h1>
            <p className="text-muted-foreground mb-2">
              {passed
                ? `You passed the ${submitResult.jobPosition} assessment for ${submitResult.companyName}.`
                : `You did not meet the requirements for ${submitResult.jobPosition} at ${submitResult.companyName}.`}
            </p>
            {tabSwitches > 0 && (
              <p className="text-yellow-400 text-xs mb-4">{tabSwitches} tab switch{tabSwitches > 1 ? "es" : ""} detected</p>
            )}

            <div className="grid grid-cols-2 gap-3 my-8">
              {[
                { label: "Your WPM", value: submitResult.wpm, target: `Required: ${submitResult.passingWpm}`, ok: submitResult.wpm >= submitResult.passingWpm },
                { label: "Accuracy", value: `${submitResult.accuracy.toFixed(1)}%`, target: `Required: ${submitResult.minAccuracy}%`, ok: submitResult.accuracy >= submitResult.minAccuracy },
                { label: "CPM", value: submitResult.cpm, target: "Characters/min", ok: true },
                { label: "Errors", value: submitResult.errorCount, target: "Keystrokes", ok: submitResult.errorCount <= 10 },
              ].map(({ label, value, target, ok }) => (
                <div key={label} className={`bg-card border rounded-xl p-4 ${ok ? "border-border/60" : "border-red-500/30"}`}>
                  <div className={`text-2xl font-bold mb-0.5 ${ok ? "" : "text-red-400"}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{target}</div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {passed
                ? "The recruiter will be in touch with you. You may close this window."
                : "Your results have been recorded. You may close this window."}
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}
