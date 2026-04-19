import { Link, useNavigate, useRouterState, Navigate } from "@tanstack/react-router";
import { Wallet, LayoutDashboard, Users, User, LogOut, Activity as ActivityIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      return <Navigate to="/login" />;
    }
    return null;
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/activity", label: "Activity", icon: ActivityIcon },
    { to: "/groups", label: "Groups", icon: Users },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen relative">
      <AnimatedBlobs />
      <div className="fixed inset-0 z-0 grid-overlay pointer-events-none" />
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl rounded-full glass-strong shadow-elegant transition-all duration-300">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/dashboard" id="brand-link" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full btn-gradient">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">Splitly</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  id={`nav-${label.toLowerCase()}`}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <Button
            id="signout-btn"
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] rounded-full glass-strong shadow-elegant md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                id={`mnav-${label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs transition-all ${
                  active ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 md:pb-12 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
