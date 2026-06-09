import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Zap } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "At least 3 characters").max(30, "Max 30 characters").regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();

  useEffect(() => {
    if (isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated]);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterForm) {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/dashboard");
        },
        onError: (err: unknown) => {
          setError("email", { message: "Email or username already in use" });
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
            <h1 className="text-2xl font-bold" data-testid="register-heading">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start tracking your typing speed today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="speedtyper"
                className="mt-1"
                {...register("username")}
                data-testid="input-username"
              />
              {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
            </div>
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
                placeholder="At least 8 characters"
                className="mt-1"
                {...register("password")}
                data-testid="input-password"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register-submit">
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
