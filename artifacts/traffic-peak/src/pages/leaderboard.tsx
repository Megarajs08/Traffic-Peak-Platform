import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useGetLeaderboard, useGetMyRank } from "@workspace/api-client-react";
import { getGetLeaderboardQueryKey, getGetMyRankQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Trophy, Medal } from "lucide-react";

type Period = "all" | "weekly" | "monthly";

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("all");
  const { isAuthenticated } = useAuth();

  const { data: entries = [], isLoading } = useGetLeaderboard(
    { period, limit: 50 },
    { query: { queryKey: getGetLeaderboardQueryKey({ period, limit: 50 }) } }
  );
  const { data: myRank } = useGetMyRank(
    { period },
    { query: { enabled: isAuthenticated, queryKey: getGetMyRankQueryKey({ period }) } }
  );

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-sm font-mono text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="leaderboard-heading">Leaderboard</h1>
          <p className="text-muted-foreground">Top typists ranked by best WPM.</p>
        </div>

        {/* My rank card */}
        {isAuthenticated && myRank && myRank.rank !== null && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between" data-testid="my-rank-card">
            <div>
              <div className="text-sm font-medium text-primary">Your Rank</div>
              <div className="text-2xl font-extrabold">#{myRank.rank}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Best WPM</div>
              <div className="text-2xl font-mono font-bold" data-testid="my-best-wpm">{myRank.wpm}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              <div className="text-2xl font-mono font-bold">{myRank.accuracy}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">of {myRank.totalUsers}</div>
            </div>
          </div>
        )}

        {/* Period tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit" data-testid="period-selector">
          {(["all", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`period-${p}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden" data-testid="leaderboard-table">
          <div className="grid grid-cols-12 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2 text-right">WPM</div>
            <div className="col-span-2 text-right">Accuracy</div>
            <div className="col-span-2 text-right">Tests</div>
          </div>

          {isLoading ? (
            <div className="space-y-0">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-4 border-t border-border">
                  <div className="col-span-12 h-4 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground" data-testid="empty-leaderboard">
              No results yet. Take a typing test to appear here!
            </div>
          ) : (
            entries.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 px-4 py-4 border-t border-border/50 hover:bg-muted/30 transition-colors items-center"
                data-testid={`leaderboard-row-${entry.rank}`}
              >
                <div className="col-span-1 flex items-center">{rankIcon(entry.rank)}</div>
                <div className="col-span-5">
                  <Link href={`/profile/${entry.username}`} className="font-medium hover:text-primary transition-colors" data-testid={`leaderboard-username-${entry.rank}`}>
                    {entry.username}
                  </Link>
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-primary" data-testid={`leaderboard-wpm-${entry.rank}`}>{entry.wpm}</div>
                <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">{entry.accuracy}%</div>
                <div className="col-span-2 text-right text-sm text-muted-foreground">{entry.testCount}</div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
