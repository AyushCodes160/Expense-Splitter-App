import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — Splitly" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBlobs />
      <div className="fixed inset-0 z-0 grid-overlay pointer-events-none" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" id="login-brand" className="mb-10 flex items-center justify-center gap-3 animate-fade-in-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient shadow-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold gradient-text">Splitly</span>
          </Link>

          <div className="glass rounded-[2rem] p-8 animate-scale-in">
            <h1 className="text-3xl font-bold glow-text animate-text-glow">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to continue splitting expenses</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" id="login-form">
              <div className="space-y-2 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 bg-muted/30"
                />
              </div>
              <div className="space-y-2 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 bg-muted/30"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                id="login-submit"
                className="btn-gradient h-12 w-full text-base font-semibold animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                {submitting ? "Signing in..." : "Sign in →"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              New here?{" "}
              <Link to="/register" id="link-to-register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
