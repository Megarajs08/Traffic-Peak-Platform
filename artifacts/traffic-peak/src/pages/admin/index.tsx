import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { SEOMeta } from "@/components/SEOMeta";
import { useAuth } from "@/contexts/auth-context";
import { useListPosts, useAdminListPosts, useDeletePost, getAdminListPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit, Trash2, Eye, EyeOff, AlertCircle,
  ShieldCheck, ShieldOff, UserCheck, Users, FileText,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AdminUser {
  id: number;
  email: string;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
}

// â”€â”€ API helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function grantAdmin(email: string) {
  const res = await fetch("/api/admin/users/grant", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to grant admin");
  return data;
}

async function revokeAdmin(email: string) {
  const res = await fetch("/api/admin/users/revoke", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to revoke admin");
  return data;
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function BlogTab() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: posts = [], isLoading } = useAdminListPosts(
    { limit: 100 },
    { query: { queryKey: getAdminListPostsQueryKey({ limit: 100 }) } }
  );

  const deletePost = useDeletePost();

  function handleDelete(id: number) {
    deletePost.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPostsQueryKey({ limit: 100 }) });
        setConfirmDelete(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        No posts yet.{" "}
        <Link href="/admin/posts/new" className="text-primary hover:underline">
          Create your first post.
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => (
            <motion.tr
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="font-medium line-clamp-1">{post.title}</div>
                <div className="text-xs text-muted-foreground font-mono">/blog/{post.slug}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{post.category}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {post.published ? (
                  <span className="flex items-center gap-1 text-green-500 text-xs">
                    <Eye className="w-3 h-3" /> Published
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <EyeOff className="w-3 h-3" /> Draft
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                {new Date(post.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/admin/posts/${post.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  {confirmDelete === post.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletePost.isPending}
                      >
                        Confirm
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDelete(post.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab({ currentUserEmail }: { currentUserEmail: string }) {
  const { toast } = useToast();
  const [grantEmail, setGrantEmail] = useState("");
  const [revokeEmail, setRevokeEmail] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const USERS_KEY = ["admin-users"];

  const { data: users = [], isLoading, refetch } = useQuery<AdminUser[]>({
    queryKey: USERS_KEY,
    queryFn: fetchAdminUsers,
  });

  const grantMutation = useMutation({
    mutationFn: grantAdmin,
    onSuccess: (data) => {
      toast({ title: "Access granted", description: data.message });
      setGrantEmail("");
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeAdmin,
    onSuccess: (data) => {
      toast({ title: "Access revoked", description: data.message });
      setRevokeEmail("");
      setConfirmRevoke(null);
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setConfirmRevoke(null);
    },
  });

  const admins = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role !== "admin");

  return (
    <div className="space-y-8">
      {/* Grant access */}
      <div className="rounded-xl border border-border/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Grant Admin Access</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          The user must already have a Typing Peak account. Enter their registered email address.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="user@example.com"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            className="max-w-sm"
            onKeyDown={(e) => e.key === "Enter" && grantEmail && grantMutation.mutate(grantEmail)}
          />
          <Button
            onClick={() => grantMutation.mutate(grantEmail)}
            disabled={!grantEmail.trim() || grantMutation.isPending}
            size="sm"
            className="gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            {grantMutation.isPending ? "Grantingâ€¦" : "Grant"}
          </Button>
        </div>
      </div>

      {/* Revoke access */}
      <div className="rounded-xl border border-border/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-destructive" />
          <h2 className="font-semibold text-sm">Revoke Admin Access</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          This will downgrade the user back to a regular account. You cannot revoke your own access.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="admin@example.com"
            value={revokeEmail}
            onChange={(e) => { setRevokeEmail(e.target.value); setConfirmRevoke(null); }}
            className="max-w-sm"
          />
          {confirmRevoke === revokeEmail && revokeEmail ? (
            <div className="flex gap-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => revokeMutation.mutate(revokeEmail)}
                disabled={revokeMutation.isPending}
              >
                {revokeMutation.isPending ? "Revokingâ€¦" : "Confirm Revoke"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5"
              disabled={!revokeEmail.trim()}
              onClick={() => setConfirmRevoke(revokeEmail)}
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Revoke
            </Button>
          )}
        </div>
      </div>

      {/* Admin list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Current Admins</h2>
            <Badge variant="secondary">{admins.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-7 gap-1 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            No admins found.
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Username</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">Joined</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Role</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-xs">
                      {u.email}
                      {u.email === currentUserEmail && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">you</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">@{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "â€”"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="default" className="text-[10px] gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Admin
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All users summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">All Users</h2>
          <Badge variant="outline">{users.length} total</Badge>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Username</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">Joined</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-xs">
                      {u.email}
                      {u.email === currentUserEmail && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">you</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">@{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "â€”"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role === "admin" ? (
                        <Badge variant="default" className="text-[10px] gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">User</Badge>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const isOwner = user?.email === "megarajse@gmail.com";

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center px-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this panel.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOMeta title="Admin Panel" noIndex />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Logged in as {user.email}</p>
          </div>
        </div>

        {isOwner ? (
          <Tabs defaultValue="blog">
            <TabsList className="mb-6">
              <TabsTrigger value="blog" className="gap-2">
                <FileText className="w-3.5 h-3.5" />
                Blog Posts
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-3.5 h-3.5" />
                User Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blog">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Posts</h2>
                <Link href="/admin/posts/new">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Post
                  </Button>
                </Link>
              </div>
              <BlogTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab currentUserEmail={user.email} />
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Posts</h2>
              <Link href="/admin/posts/new">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </Link>
            </div>
            <BlogTab />
          </div>
        )}
      </main>
    </div>
  );
}
