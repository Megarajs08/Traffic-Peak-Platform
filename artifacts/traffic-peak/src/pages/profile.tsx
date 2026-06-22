import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { Zap, Target, BarChart2, Calendar } from "lucide-react";

export default function Profile() {
  const [, params] = useRoute("/profile/:username");
  const username = params?.username ?? "";

  const { data: profile, isLoading, isError } = useGetUserProfile(username, {
    query: { enabled: !!username, queryKey: getGetUserProfileQueryKey(username) },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-muted animate-pulse rounded-full" />
            <div className="h-6 bg-muted animate-pulse rounded w-32" />
          </div>
        ) : isError || !profile ? (
          <div className="text-center py-16" data-testid="profile-not-found">
            <h2 className="text-xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground">This profile doesn't exist.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} data-testid="user-profile">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-10">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-extrabold text-primary">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="profile-username">{profile.username}</h1>
                {profile.name && <p className="text-muted-foreground">{profile.name}</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, label: "Best WPM", value: Math.round(profile.bestWpm), color: "text-primary" },
                { icon: BarChart2, label: "Avg WPM", value: Math.round(profile.avgWpm), color: "text-blue-400" },
                { icon: Target, label: "Avg Accuracy", value: `${Math.round(profile.avgAccuracy)}%`, color: "text-green-400" },
                { icon: BarChart2, label: "Total Tests", value: profile.totalTests, color: "text-purple-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5 text-center"
                  data-testid={`profile-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-2xl font-extrabold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
