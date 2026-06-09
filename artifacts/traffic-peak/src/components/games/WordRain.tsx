import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { top1000Words } from "@/lib/words";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
}

let nextId = 0;

export default function WordRain({ onExit }: { onExit: () => void }) {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const gameStartTime = useRef(0);

  const GAME_HEIGHT = 480;
  const MAX_MISSED = 5;

  const spawnWord = useCallback(() => {
    const word = top1000Words[Math.floor(Math.random() * top1000Words.length)];
    const x = Math.random() * 80 + 5;
    setWords((prev) => [
      ...prev,
      { id: nextId++, word, x, y: 0, speed: 0.04 + Math.random() * 0.06 },
    ]);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    gameStartTime.current = Date.now();

    function tick() {
      const now = Date.now();
      if (now - lastSpawnRef.current > 1800) {
        spawnWord();
        lastSpawnRef.current = now;
      }
      setWords((prev) => {
        const next: FallingWord[] = [];
        let newMissed = 0;
        for (const w of prev) {
          const ny = w.y + w.speed;
          if (ny > 100) {
            newMissed++;
          } else {
            next.push({ ...w, y: ny });
          }
        }
        if (newMissed > 0) {
          setMissed((m) => {
            const total = m + newMissed;
            if (total >= MAX_MISSED) setGameOver(true);
            return total;
          });
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [started, gameOver, spawnWord]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    const trimmed = val.trim().toLowerCase();
    setWords((prev) => {
      const idx = prev.findIndex((w) => w.word.toLowerCase() === trimmed);
      if (idx >= 0) {
        setScore((s) => s + 1);
        setInput("");
        return prev.filter((_, i) => i !== idx);
      }
      return prev;
    });
  }

  function restart() {
    setWords([]);
    setInput("");
    setScore(0);
    setMissed(0);
    setGameOver(false);
    setStarted(true);
    lastSpawnRef.current = 0;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6" data-testid="button-exit-game">
          <ArrowLeft className="w-4 h-4" />Back to Games
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Word Rain</h2>
          <div className="flex gap-6 text-sm">
            <span className="text-primary font-bold font-mono" data-testid="game-score">Score: {score}</span>
            <span className="text-red-400 font-mono">Missed: {missed}/{MAX_MISSED}</span>
          </div>
        </div>

        {!started ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">Type the falling words before they reach the bottom!</p>
            <Button onClick={() => { setStarted(true); lastSpawnRef.current = 0; setTimeout(() => inputRef.current?.focus(), 50); }} data-testid="button-start-game">Start Game</Button>
          </div>
        ) : gameOver ? (
          <div className="text-center py-20" data-testid="game-over">
            <h3 className="text-2xl font-bold mb-2">Game Over</h3>
            <p className="text-muted-foreground mb-2">You typed <span className="text-primary font-bold">{score}</span> words!</p>
            <p className="text-muted-foreground mb-6">Missed {missed} words.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={restart} data-testid="button-restart-game">Play Again</Button>
              <Button variant="outline" onClick={onExit}>Exit</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative bg-card border border-border rounded-xl overflow-hidden mb-4" style={{ height: GAME_HEIGHT }} data-testid="game-arena">
              {words.map((w) => (
                <span
                  key={w.id}
                  className="absolute font-mono font-bold text-foreground text-lg px-2 py-0.5 bg-primary/10 border border-primary/20 rounded transition-none"
                  style={{ left: `${w.x}%`, top: `${w.y}%`, transform: "translateX(-50%)" }}
                >
                  {w.word}
                </span>
              ))}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/30" />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              placeholder="Type the falling words..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background font-mono text-lg focus:outline-none focus:border-primary"
              autoFocus
              data-testid="game-input"
            />
          </>
        )}
      </main>
    </div>
  );
}
