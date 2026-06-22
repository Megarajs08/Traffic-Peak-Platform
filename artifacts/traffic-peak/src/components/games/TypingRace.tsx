import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";
import { top1000Words } from "@/lib/words";

const AI_WPM_OPTIONS = [30, 50, 70, 100];
const RACE_TEXT_WORDS = 40;

function generateRaceText() {
  const shuffled = [...top1000Words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, RACE_TEXT_WORDS).join(" ");
}

type CharState = "pending" | "correct" | "incorrect" | "current";
interface CharData { char: string; state: CharState; }

export default function TypingRace({ onExit }: { onExit: () => void }) {
  const [aiWpm, setAiWpm] = useState(50);
  const [text] = useState(() => generateRaceText());
  const [chars, setChars] = useState<CharData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [userProgress, setUserProgress] = useState(0); // 0-100%
  const [aiProgress, setAiProgress] = useState(0);     // 0-100%
  const [winner, setWinner] = useState<"user" | "ai" | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const c: CharData[] = text.split("").map((char, i) => ({
      char,
      state: i === 0 ? "current" : "pending",
    }));
    setChars(c);
  }, [text]);

  // AI progress simulation
  useEffect(() => {
    if (!started || finished) return;
    const totalChars = text.length;
    const charsPerMs = (aiWpm * 5) / 60000;
    const start = Date.now();
    aiTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const aiChars = Math.min(elapsed * charsPerMs, totalChars);
      const pct = (aiChars / totalChars) * 100;
      setAiProgress(pct);
      if (pct >= 100 && !finished && winner === null) {
        setWinner("ai");
        setFinished(true);
        clearInterval(aiTimerRef.current!);
      }
    }, 50);
    return () => { if (aiTimerRef.current) clearInterval(aiTimerRef.current); };
  }, [started, finished, aiWpm, text, winner]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
        setUserProgress(((currentIndex - 1) / text.length) * 100);
      }
      return;
    }
    if (key.length !== 1) return;
    e.preventDefault();

    const expectedChar = chars[currentIndex]?.char;
    if (expectedChar === " " && key !== " ") return;

    if (!started) { setStarted(true); setStartTime(Date.now()); }

    const isCorrect = key === expectedChar;
    if (isCorrect) setCorrectChars((c) => c + 1);
    else setErrors((err) => err + 1);

    setChars((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], state: isCorrect ? "correct" : "incorrect" };
      const nextIdx = currentIndex + 1;
      if (nextIdx < next.length) next[nextIdx] = { ...next[nextIdx], state: "current" };
      return next;
    });

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    const pct = (nextIdx / text.length) * 100;
    setUserProgress(pct);
    if (nextIdx >= text.length && winner === null) {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
      setWinner("user");
      setFinished(true);
    }
  }, [finished, started, currentIndex, chars, text, winner]);

  const elapsed = started ? (Date.now() - startTime) / 1000 / 60 : 0;
  const wpm = elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;

  function restart() { window.location.reload(); }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl" onClick={() => inputRef.current?.focus()}>
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6" data-testid="button-exit-game">
          <ArrowLeft className="w-4 h-4" />Back to Games
        </button>
        <h2 className="text-2xl font-bold mb-6">Race vs AI</h2>

        {/* AI speed selector */}
        {!started && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">AI Speed:</p>
            <div className="flex gap-2">
              {AI_WPM_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setAiWpm(w)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors ${aiWpm === w ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
                  data-testid={`ai-wpm-${w}`}
                >
                  {w} WPM
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress bars */}
        <div className="space-y-4 mb-8">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">You</span>
              <span className="font-mono text-primary">{Math.round(userProgress)}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${userProgress}%` }} data-testid="user-progress" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 font-medium"><Bot className="w-4 h-4" /> AI ({aiWpm} WPM)</span>
              <span className="font-mono text-muted-foreground">{Math.round(aiProgress)}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-100" style={{ width: `${aiProgress}%` }} data-testid="ai-progress" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="bg-card border border-border rounded-xl p-6 font-mono text-xl leading-relaxed mb-4 max-h-44 overflow-hidden cursor-text">
          {chars.map((c, i) => (
            <span key={i} className={`relative ${
              c.state === "correct" ? "text-foreground" :
              c.state === "incorrect" ? "text-red-400 bg-red-400/10" :
              c.state === "current" ? "text-foreground" :
              "text-muted-foreground/50"
            }`}>
              {c.state === "current" && <span className="absolute -left-0.5 top-0 w-0.5 h-full bg-primary caret-blink" />}
              {c.char}
            </span>
          ))}
        </div>

        <input ref={inputRef} className="fixed -top-96 w-0 h-0 opacity-0" onKeyDown={handleKeyDown} readOnly autoFocus data-testid="race-input" />
        {!started && <p className="text-center text-sm text-muted-foreground">Start typing to begin the race!</p>}

        {/* Result */}
        {finished && (
          <div className={`mt-6 rounded-xl p-6 text-center border ${winner === "user" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`} data-testid="race-result">
            <div className="text-2xl font-bold mb-1">{winner === "user" ? "You Win!" : "AI Wins!"}</div>
            <div className="text-muted-foreground text-sm mb-4">Your speed: <span className="font-mono text-primary">{wpm} WPM</span></div>
            <div className="flex gap-3 justify-center">
              <Button onClick={restart} data-testid="button-race-again">Race Again</Button>
              <Button variant="outline" onClick={onExit}>Exit</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
