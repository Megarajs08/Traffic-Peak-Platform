import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Zap } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const login = useLogin();
  const searchParams = new URLSearchParams(window.location.search);
  const oauthError = searchParams.get("error");

  const oauthErrorText: Record<string, string> = {
    google_not_configured: "Google login is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the API server environment.",
    google_cancelled: "Google login was cancelled.",
    google_no_email: "Google account did not return an email address.",
    google_failed: "Google login failed. Please try again.",
  };

  useEffect(() => {
    if (isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginForm) {
    login.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/dashboard");
        },
        onError: () => {
          setError("email", { message: "Invalid email or password" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold" data-testid="login-heading">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your TypingPeak account</p>
          </div>

          {oauthError && oauthErrorText[oauthError] && (
            <div className="mb-4 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-800" data-testid="google-oauth-error">
              {oauthErrorText[oauthError]}
            </div>
          )}

          {/* Google Sign-In */}
          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            data-testid="button-google-login"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1"
                {...register("email")}
                data-testid="input-email"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="mt-1"
                {...register("password")}
                data-testid="input-password"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="button-login-submit">
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
