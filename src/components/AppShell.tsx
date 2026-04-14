import { Link, useNavigate, useRouterState, Navigate } from "@tanstack/react-router";
import { Wallet, LayoutDashboard, Users, User, LogOut, Activity as ActivityIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" id="brand-link" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-gradient">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold gradient-text">Splitly</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  id={`nav-${label.toLowerCase()}`}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                id={`mnav-${label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-xs ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:pb-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
