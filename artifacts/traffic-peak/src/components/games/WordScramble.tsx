import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { top1000Words } from "@/lib/words";

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word && word.length > 1 ? scramble(word) : result;
}

function pickWord() {
  const pool = top1000Words.filter((w) => w.length >= 4 && w.length <= 8);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WordScramble({ onExit }: { onExit: () => void }) {
  const [word, setWord] = useState(() => pickWord());
  const [scrambled, setScrambled] = useState(() => "");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [skips, setSkips] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setScrambled(scramble(word));
    setInput("");
    inputRef.current?.focus();
  }, [word]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().toLowerCase() === word.toLowerCase()) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setTimeout(() => { setFeedback(null); setWord(pickWord()); }, 600);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
    setInput("");
  }

  function skip() {
    setSkips((s) => s + 1);
    setWord(pickWord());
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg text-center">
        <div className="flex items-center mb-6">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="button-exit-game">
            <ArrowLeft className="w-4 h-4" />Back to Games
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2">Word Scramble</h2>
        <p className="text-muted-foreground mb-8">Unscramble the letters and type the correct word</p>

        <div className="flex items-center justify-center gap-6 mb-6 text-sm">
          <span className="text-primary font-bold font-mono" data-testid="scramble-score">Score: {score}</span>
          <span className="text-muted-foreground font-mono">Skips: {skips}</span>
        </div>

        <div
          className={`text-5xl font-mono font-extrabold tracking-widest mb-10 transition-colors ${
            feedback === "correct" ? "text-green-400" : feedback === "wrong" ? "text-red-400 animate-pulse" : "text-foreground"
          }`}
          data-testid="scrambled-word"
        >
          {scrambled}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type the word..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background font-mono text-lg focus:outline-none focus:border-primary"
            data-testid="scramble-input"
          />
          <Button type="submit" data-testid="button-scramble-submit">Go</Button>
        </form>
        <button onClick={skip} className="mt-4 text-sm text-muted-foreground hover:text-foreground underline" data-testid="button-skip-word">
          Skip word
        </button>
      </main>
    </div>
  );
}
