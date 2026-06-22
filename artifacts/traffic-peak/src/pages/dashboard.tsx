import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useGetMyStats, useGetProgress, useGetStatsSummary, useListTests } from "@workspace/api-client-react";
import { getGetMyStatsQueryKey, getGetProgressQueryKey, getGetStatsSummaryQueryKey, getListTestsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Target, Clock, Flame, Trophy, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Period = "daily" | "weekly" | "monthly";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { data: summary } = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const { data: stats } = useGetMyStats({ query: { queryKey: getGetMyStatsQueryKey() } });
  const { data: progress = [] } = useGetProgress(
    { period: "weekly" },
    { query: { queryKey: getGetProgressQueryKey({ period: "weekly" }) } }
  );
  const { data: recentTests = [] } = useListTests(
    { limit: 10 },
    { query: { queryKey: getListTestsQueryKey({ limit: 10 }) } }
  );

  const summaryCards = [
    { icon: Zap, label: "Best WPM", value: Math.round(summary?.bestWpm ?? 0), color: "text-primary" },
    { icon: Target, label: "Avg Accuracy", value: `${summary?.avgAccuracy ?? 0}%`, color: "text-green-400" },
    { icon: BarChart2, label: "Total Tests", value: summary?.totalTests ?? 0, color: "text-blue-400" },
    { icon: Clock, label: "Tests Today", value: summary?.testsToday ?? 0, color: "text-purple-400" },
    { icon: Flame, label: "Streak", value: `${summary?.currentStreak ?? 0}d`, color: "text-orange-400" },
    { icon: Trophy, label: "Rank", value: summary?.rank ? `#${summary.rank}` : "-", color: "text-yellow-400" },
  ];

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold" data-testid="dashboard-heading">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your typing performance at a glance.</p>
          </div>
          <Link href="/typing-test">
            <Button data-testid="button-new-test">New Test</Button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
              data-testid={`summary-card-${card.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <card.icon className={`w-5 h-5 mx-auto mb-2 ${card.color}`} />
              <div className={`text-2xl font-extrabold font-mono ${card.color}`}>{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress chart */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">WPM Progress (Last 7 days)</h2>
          {progress.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm" data-testid="empty-progress">
              No progress data yet. Take some tests to see your chart!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area type="monotone" dataKey="avgWpm" stroke="#2563EB" fill="url(#wpmGrad)" strokeWidth={2} name="Avg WPM" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent tests */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Tests</h2>
          </div>
          {recentTests.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm" data-testid="empty-tests">
              No tests yet.{" "}
              <Link href="/typing-test" className="text-primary hover:underline">Take your first test</Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentTests.map((test) => (
                <div key={test.id} className="px-6 py-4 flex items-center justify-between" data-testid={`test-row-${test.id}`}>
                  <div>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{test.mode}</span>
                    <span className="text-xs text-muted-foreground ml-3">{new Date(test.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-mono font-bold text-primary" data-testid={`test-wpm-${test.id}`}>{Math.round(test.wpm)} WPM</span>
                    <span className="text-muted-foreground">{Math.round(test.accuracy)}% acc</span>
                    <span className="text-muted-foreground">{test.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
