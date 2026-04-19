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

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Sign up — Splitly" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading, setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("/api/auth/register", {
        email,
        password,
        username,
        full_name: fullName,
      });
      setToken(res.data.token);
      toast.success("Account created! You're signed in.");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to register");
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
          <Link to="/" id="register-brand" className="mb-10 flex items-center justify-center gap-3 animate-fade-in-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient shadow-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold gradient-text">Splitly</span>
          </Link>

          <div className="glass rounded-[2rem] p-8 animate-scale-in">
            <h1 className="text-3xl font-bold glow-text animate-text-glow">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start splitting expenses in seconds</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" id="register-form">
              <div className="space-y-2 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="register-fullname">Full name</Label>
                <Input
                  id="register-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Alex Johnson"
                  className="h-12 bg-muted/30"
                />
              </div>
              <div className="space-y-2 animate-slide-in-right" style={{ animationDelay: '0.15s' }}>
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                  required
                  minLength={3}
                  placeholder="alex_j"
                  className="h-12 bg-muted/30"
                />
              </div>
              <div className="space-y-2 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 bg-muted/30"
                />
              </div>
              <div className="space-y-2 animate-slide-in-right" style={{ animationDelay: '0.25s' }}>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="h-12 bg-muted/30"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                id="register-submit"
                className="btn-gradient h-12 w-full text-base font-semibold animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                {submitting ? "Creating account..." : "Create account →"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Already have an account?{" "}
              <Link to="/login" id="link-to-login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
