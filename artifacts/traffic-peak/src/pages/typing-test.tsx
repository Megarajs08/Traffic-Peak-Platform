import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useSubmitTest, useGenerateCertificate } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Award } from "lucide-react";
import { top1000Words } from "@/lib/words";

type Mode = "words" | "paragraph" | "quotes" | "numbers" | "symbols";
type Duration = 15 | 30 | 60 | 120 | 300;
type CharState = "pending" | "correct" | "incorrect" | "current";

interface CharData {
  char: string;
  state: CharState;
}

const MODES: { id: Mode; label: string }[] = [
  { id: "words", label: "words" },
  { id: "paragraph", label: "paragraph" },
  { id: "quotes", label: "quotes" },
  { id: "numbers", label: "numbers" },
  { id: "symbols", label: "symbols" },
];

const DURATIONS: Duration[] = [15, 30, 60, 120, 300];

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "In the middle of every difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
];

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog near the riverbank where the water flows silently under the old wooden bridge. Birds sing softly in the morning mist as the sun rises slowly above the distant mountains casting long golden shadows across the valley floor below.",
  "Technology has transformed the way we communicate and collaborate across the globe. Remote teams now work seamlessly across time zones sharing documents and ideas in real time. The pace of innovation continues to accelerate pushing boundaries of what was once considered impossible.",
];

function generateText(mode: Mode): string {
  switch (mode) {
    case "words": {
      const shuffled = [...top1000Words].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 60).join(" ");
    }
    case "paragraph":
      return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    case "quotes":
      return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    case "numbers": {
      const nums: string[] = [];
      for (let i = 0; i < 40; i++) {
        nums.push(String(Math.floor(Math.random() * 9999)));
      }
      return nums.join(" ");
    }
    case "symbols": {
      const syms = "!@#$%^&*()-_=+[]{}|;:,.<>?/".split("");
      const parts: string[] = [];
      for (let i = 0; i < 50; i++) {
        let s = "";
        for (let j = 0; j < Math.floor(Math.random() * 4) + 2; j++) {
          s += syms[Math.floor(Math.random() * syms.length)];
        }
        parts.push(s);
      }
      return parts.join(" ");
    }
  }
}

export default function TypingTest() {
  const [mode, setMode] = useState<Mode>("words");
  const [duration, setDuration] = useState<Duration>(60);
  const [text, setText] = useState(() => generateText("words"));
  const [chars, setChars] = useState<CharData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certName, setCertName] = useState("");
  const [submittedTestId, setSubmittedTestId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const { isAuthenticated, user } = useAuth();
  const submitTest = useSubmitTest();
  const generateCert = useGenerateCertificate();

  // Initialize chars when text changes
  useEffect(() => {
    const newChars: CharData[] = text.split("").map((char, i) => ({
      char,
      state: i === 0 ? "current" : "pending",
    }));
    setChars(newChars);
    setCurrentIndex(0);
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setErrors(0);
    setTotalTyped(0);
    setCorrectChars(0);
    setElapsedMs(0);
  }, [text, duration]);

  // Reset when mode/duration changes
  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setText(generateText(mode));
  }, [mode]);

  useEffect(() => {
    setTimeLeft(duration);
    reset();
  }, [duration, reset]);

  // Timer
  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setFinished(true);
            return 0;
          }
          return t - 1;
        });
        setElapsedMs(Date.now() - startTime);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished, startTime]);

  // Auto-submit on finish
  useEffect(() => {
    if (finished && correctChars > 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const wpm = elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;
      const cpm = elapsed > 0 ? Math.round(correctChars / elapsed) : 0;
      const accuracy = totalTyped > 0 ? Math.round((correctChars / (correctChars + errors)) * 100) : 0;

      submitTest.mutate(
        {
          data: { wpm, cpm, accuracy, duration, mode, errorCount: errors, charCount: correctChars },
        },
        {
          onSuccess: (result) => {
            setSubmittedTestId(result.id);
          },
        }
      );
    }
  }, [finished]);

  // Scroll current char into view
  useEffect(() => {
    currentCharRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentIndex]);

  // Tab+Enter to restart
  useEffect(() => {
    let tabPressed = false;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        e.preventDefault();
        tabPressed = true;
      } else if (e.key === "Enter" && tabPressed) {
        e.preventDefault();
        reset();
        tabPressed = false;
      } else {
        tabPressed = false;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finished) return;

      const key = e.key;

      if (key === "Backspace") {
        e.preventDefault();
        if (currentIndex > 0) {
          setChars((prev) => {
            const next = [...prev];
            next[currentIndex] = { ...next[currentIndex], state: "pending" };
            next[currentIndex - 1] = { ...next[currentIndex - 1], state: "current" };
            return next;
          });
          setCurrentIndex((i) => i - 1);
        }
        return;
      }

      if (key.length !== 1) return;

      e.preventDefault();

      if (!started) {
        setStarted(true);
        setStartTime(Date.now());
      }

      const expected = chars[currentIndex]?.char;
      const isCorrect = key === expected;

      setTotalTyped((t) => t + 1);
      if (isCorrect) setCorrectChars((c) => c + 1);
      else setErrors((err) => err + 1);

      setChars((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          state: isCorrect ? "correct" : "incorrect",
        };
        const nextIdx = currentIndex + 1;
        if (nextIdx < next.length) {
          next[nextIdx] = { ...next[nextIdx], state: "current" };
        }
        return next;
      });

      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      if (nextIdx >= chars.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setFinished(true);
      }
    },
    [finished, started, currentIndex, chars]
  );

  const elapsedMinutes = useMemo(() => {
    const ms = started ? (finished ? elapsedMs : Date.now() - startTime) : 0;
    return Math.max(ms / 1000 / 60, 0.001);
  }, [started, finished, elapsedMs, startTime]);

  const liveWpm = useMemo(() => {
    if (!started) return 0;
    return Math.round(correctChars / 5 / elapsedMinutes);
  }, [correctChars, elapsedMinutes, started]);

  const liveCpm = useMemo(() => {
    if (!started) return 0;
    return Math.round(correctChars / elapsedMinutes);
  }, [correctChars, elapsedMinutes, started]);

  const liveAccuracy = useMemo(() => {
    if (totalTyped === 0) return 100;
    return Math.round((correctChars / totalTyped) * 100);
  }, [correctChars, totalTyped]);

  const finalWpm = useMemo(() => {
    if (!finished) return liveWpm;
    const elapsed = (duration - timeLeft) / 60 || (elapsedMs / 1000 / 60);
    return elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;
  }, [finished, liveWpm, duration, timeLeft, correctChars, elapsedMs]);

  return (
    <div className="min-h-screen flex flex-col" onClick={() => inputRef.current?.focus()}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-start pt-12 px-4 pb-8">
        {/* Mode selector */}
        <div className="flex items-center gap-1 mb-6 bg-muted rounded-lg p-1" data-testid="mode-selector">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); reset(); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === m.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`mode-${m.id}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-1 mb-10" data-testid="duration-selector">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                duration === d ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`duration-${d}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-5 gap-6 mb-8 w-full max-w-2xl text-center" data-testid="live-stats">
          {[
            { label: "wpm", value: liveWpm, testId: "stat-wpm" },
            { label: "cpm", value: liveCpm, testId: "stat-cpm" },
            { label: "accuracy", value: `${liveAccuracy}%`, testId: "stat-accuracy" },
            { label: "errors", value: errors, testId: "stat-errors" },
            { label: "time", value: timeLeft, testId: "stat-time" },
          ].map((s) => (
            <div key={s.label} data-testid={s.testId}>
              <div className="text-2xl font-mono font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Text display */}
        <div
          ref={textContainerRef}
          className="relative w-full max-w-3xl bg-card border border-border rounded-xl p-8 font-mono text-xl leading-relaxed max-h-48 overflow-hidden cursor-text"
          onClick={() => inputRef.current?.focus()}
          data-testid="typing-text-container"
        >
          {chars.map((c, i) => (
            <span
              key={i}
              ref={c.state === "current" ? currentCharRef : null}
              className={`relative ${
                c.state === "correct"
                  ? "text-green-400"
                  : c.state === "incorrect"
                  ? "text-red-400 bg-red-400/10"
                  : c.state === "current"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              }`}
            >
              {c.state === "current" && (
                <span className="absolute -left-0.5 top-0 w-0.5 h-full bg-primary caret-blink" />
              )}
              {c.char}
            </span>
          ))}
        </div>

        {/* Hidden input to capture keystrokes */}
        <input
          ref={inputRef}
          className="fixed -top-96 opacity-0 w-0 h-0"
          onKeyDown={handleKeyDown}
          readOnly
          autoFocus
          data-testid="typing-input"
        />

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <Button variant="outline" size="sm" onClick={reset} className="gap-2" data-testid="button-restart">
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
          <span className="text-xs text-muted-foreground">Tab + Enter to restart</span>
        </div>

        {/* Results overlay */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-background/80 backdrop-blur flex items-center justify-center z-50 p-4"
              data-testid="results-overlay"
            >
              <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
                <h2 className="text-2xl font-bold mb-8">Test Complete</h2>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <div className="text-4xl font-extrabold text-primary" data-testid="result-wpm">{finalWpm}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">WPM</div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <div className="text-4xl font-extrabold" data-testid="result-accuracy">{liveAccuracy}%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Accuracy</div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <div className="text-3xl font-bold" data-testid="result-cpm">{liveCpm}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">CPM</div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <div className="text-3xl font-bold text-red-400" data-testid="result-errors">{errors}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Errors</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={reset} className="w-full" data-testid="button-try-again">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  {isAuthenticated && submittedTestId && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowCertModal(true)}
                      data-testid="button-get-certificate"
                    >
                      <Award className="w-4 h-4" />
                      Get Certificate
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate modal */}
        <AnimatePresence>
          {showCertModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur flex items-center justify-center z-[60] p-4"
              data-testid="cert-modal"
            >
              <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold mb-2">Generate Certificate</h3>
                <p className="text-sm text-muted-foreground mb-6">Enter your name as it should appear on the certificate.</p>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground mb-4 text-sm"
                  data-testid="input-cert-name"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCertModal(false)}
                    data-testid="button-cert-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!certName.trim() || generateCert.isPending}
                    onClick={() => {
                      if (submittedTestId && certName.trim()) {
                        generateCert.mutate(
                          { data: { testResultId: submittedTestId, recipientName: certName.trim() } },
                          {
                            onSuccess: () => {
                              setShowCertModal(false);
                            },
                          }
                        );
                      }
                    }}
                    data-testid="button-cert-generate"
                  >
                    {generateCert.isPending ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
