import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useListLessons, useListLessonProgress, useSaveLessonProgress, getListLessonProgressQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle2, Lock, ChevronRight } from "lucide-react";
import LessonPlayer from "@/components/lessons/LessonPlayer";

type Level = "all" | "beginner" | "intermediate" | "advanced";

const levelColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  advanced: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function Learn() {
  const [activeLevel, setActiveLevel] = useState<Level>("all");
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const { data: lessons = [], isLoading } = useListLessons(
    activeLevel !== "all" ? { level: activeLevel } : {}
  );
  const { data: progressList = [] } = useListLessonProgress();
  const { isAuthenticated } = useAuth();

  const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

  const activeLessonData = lessons.find((l) => l.id === activeLessonId);

  if (activeLessonData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LessonPlayer
          lesson={activeLessonData}
          progress={progressMap.get(activeLessonData.id)}
          onBack={() => setActiveLessonId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="learn-heading">Learn to Type</h1>
          <p className="text-muted-foreground">Structured lessons from home row basics to advanced speed drills.</p>
        </div>

        {/* Level filter */}
        <div className="flex gap-2 mb-8" data-testid="level-filter">
          {(["all", "beginner", "intermediate", "advanced"] as Level[]).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLevel(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeLevel === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`filter-${l}`}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground" data-testid="empty-lessons">
            No lessons found. Check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson, i) => {
              const progress = progressMap.get(lesson.id);
              const completed = progress?.completed ?? false;
              const bestWpm = progress?.bestWpm ?? 0;
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => setActiveLessonId(lesson.id)}
                  data-testid={`lesson-card-${lesson.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${levelColors[lesson.level]}`}>
                      {lesson.level}
                    </span>
                    {completed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{lesson.description}</p>
                  )}
                  {bestWpm > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Best: <span className="text-primary font-mono font-bold">{Math.round(bestWpm)} WPM</span>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Lock className="w-3 h-3" />
                      Login to save progress
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{lesson.category}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
