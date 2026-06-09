import { useLocation } from "wouter";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateMyProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  name: z.string().max(100).optional(),
  avatarUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateMyProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  function onSubmit(data: SettingsForm) {
    const payload: { name?: string; avatarUrl?: string } = {};
    if (data.name) payload.name = data.name;
    if (data.avatarUrl) payload.avatarUrl = data.avatarUrl;

    updateProfile.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Profile updated" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        },
      }
    );
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-lg">
        <h1 className="text-3xl font-bold mb-2" data-testid="settings-heading">Settings</h1>
        <p className="text-muted-foreground mb-10">Update your profile information.</p>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-extrabold text-primary">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold" data-testid="settings-username">{user?.username}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="settings-form">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                className="mt-1"
                {...register("name")}
                data-testid="input-name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://..."
                className="mt-1"
                {...register("avatarUrl")}
                data-testid="input-avatar-url"
              />
              {errors.avatarUrl && <p className="text-sm text-destructive mt-1">{errors.avatarUrl.message}</p>}
            </div>
            <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-settings">
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
