import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSaveLessonProgress, getListLessonProgressQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import type { Lesson, LessonProgress } from "@workspace/api-client-react";

interface LessonPlayerProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onBack: () => void;
}

type CharState = "pending" | "correct" | "incorrect" | "current";

interface CharData {
  char: string;
  state: CharState;
}

export default function LessonPlayer({ lesson, progress, onBack }: LessonPlayerProps) {
  const [chars, setChars] = useState<CharData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const saveProgress = useSaveLessonProgress();

  function initChars() {
    const c: CharData[] = lesson.content.split("").map((char, i) => ({
      char,
      state: i === 0 ? "current" : "pending",
    }));
    setChars(c);
    setCurrentIndex(0);
    setStarted(false);
    setFinished(false);
    setErrors(0);
    setCorrectChars(0);
    setTotalTyped(0);
    setStartTime(0);
  }

  useEffect(() => { initChars(); }, [lesson.id]);

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
      next[currentIndex] = { ...next[currentIndex], state: isCorrect ? "correct" : "incorrect" };
      const nextIdx = currentIndex + 1;
      if (nextIdx < next.length) next[nextIdx] = { ...next[nextIdx], state: "current" };
      return next;
    });

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    if (nextIdx >= lesson.content.length) {
      setFinished(true);
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const wpm = elapsed > 0 ? Math.round((correctChars + (isCorrect ? 1 : 0)) / 5 / elapsed) : 0;
      const accuracy = (totalTyped + 1) > 0 ? Math.round(((correctChars + (isCorrect ? 1 : 0)) / (totalTyped + 1)) * 100) : 100;
      if (isAuthenticated) {
        saveProgress.mutate(
          { id: lesson.id, data: { wpm, accuracy, completed: accuracy >= 80 } },
          { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLessonProgressQueryKey() }) }
        );
      }
    }
  }, [finished, started, currentIndex, chars, correctChars, totalTyped, startTime, lesson, isAuthenticated]);

  const elapsed = started ? (Date.now() - startTime) / 1000 / 60 : 0;
  const wpm = elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl" onClick={() => inputRef.current?.focus()}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="button-lesson-back">
        <ArrowLeft className="w-4 h-4" />
        Back to lessons
      </button>

      <h2 className="text-2xl font-bold mb-1" data-testid="lesson-title">{lesson.title}</h2>
      <p className="text-muted-foreground mb-8 text-sm">{lesson.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center text-sm">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-mono font-bold text-primary" data-testid="lesson-wpm">{wpm}</div>
          <div className="text-xs text-muted-foreground">WPM</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-mono font-bold" data-testid="lesson-accuracy">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-mono font-bold text-red-400" data-testid="lesson-errors">{errors}</div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </div>
      </div>

      <div
        className="bg-card border border-border rounded-xl p-8 font-mono text-xl leading-relaxed cursor-text mb-6"
        onClick={() => inputRef.current?.focus()}
        data-testid="lesson-text"
      >
        {chars.map((c, i) => (
          <span
            key={i}
            className={`relative ${
              c.state === "correct" ? "text-foreground"
              : c.state === "incorrect" ? "text-red-400 bg-red-400/10"
              : c.state === "current" ? "text-foreground"
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

      <input ref={inputRef} className="fixed -top-96 w-0 h-0 opacity-0" onKeyDown={handleKeyDown} readOnly autoFocus data-testid="lesson-input" />

      {finished && (
        <div className="bg-card border border-border rounded-xl p-6 text-center" data-testid="lesson-complete">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Lesson Complete!</h3>
          <p className="text-muted-foreground text-sm mb-4">{wpm} WPM · {accuracy}% accuracy</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={initChars} className="gap-2" data-testid="button-retry-lesson">
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
            <Button onClick={onBack} data-testid="button-next-lesson">Next Lesson</Button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">Click anywhere to focus</p>
    </main>
  );
}
