import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export default function AlphabetSprint({ onExit }: { onExit: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState(false);
  const startTime = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [bestMs, setBestMs] = useState<number | null>(null);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime.current);
      }, 50);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (finished) return;
    const key = e.key.toLowerCase();
    if (!started) {
      if (key === "a") {
        setStarted(true);
        startTime.current = Date.now();
        setCurrentIdx(1);
        setError(false);
      }
      return;
    }
    const expected = ALPHABET[currentIdx];
    if (key === expected) {
      setError(false);
      const next = currentIdx + 1;
      setCurrentIdx(next);
      if (next >= ALPHABET.length) {
        const elapsed = Date.now() - startTime.current;
        setElapsedMs(elapsed);
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
        setBestMs((prev) => (prev === null || elapsed < prev ? elapsed : prev));
      }
    } else if (key.length === 1 && key.match(/[a-z]/)) {
      setError(true);
    }
  }, [started, finished, currentIdx]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  function restart() {
    setCurrentIdx(0);
    setStarted(false);
    setFinished(false);
    setElapsedMs(0);
    setError(false);
  }

  const displayTime = (ms: number) => (ms / 1000).toFixed(2) + "s";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="flex items-center mb-6">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="button-exit-game">
            <ArrowLeft className="w-4 h-4" />Back to Games
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2">Alphabet Sprint</h2>
        <p className="text-muted-foreground mb-8">Type A through Z as fast as possible</p>

        {bestMs !== null && (
          <div className="text-sm text-muted-foreground mb-4" data-testid="best-time">Best: {displayTime(bestMs)}</div>
        )}

        <div className="text-5xl font-mono font-bold tracking-widest mb-8 flex flex-wrap justify-center gap-1" data-testid="alphabet-display">
          {ALPHABET.map((letter, i) => (
            <span
              key={letter}
              className={`${
                i < currentIdx ? "text-foreground" :
                i === currentIdx ? `text-primary ${error ? "animate-pulse text-red-400" : ""}` :
                "text-muted-foreground/30"
              }`}
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="text-3xl font-mono font-bold mb-8 text-primary" data-testid="sprint-timer">
          {displayTime(elapsedMs)}
        </div>

        {!started && !finished && (
          <p className="text-muted-foreground animate-pulse" data-testid="sprint-hint">Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-foreground">A</kbd> to start</p>
        )}

        {finished && (
          <div data-testid="sprint-complete">
            <p className="text-xl font-bold mb-2">Done!</p>
            <p className="text-muted-foreground mb-6">Time: <span className="text-primary font-mono">{displayTime(elapsedMs)}</span></p>
            <div className="flex gap-3 justify-center">
              <Button onClick={restart} data-testid="button-restart-sprint">Try Again</Button>
              <Button variant="outline" onClick={onExit}>Exit</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
