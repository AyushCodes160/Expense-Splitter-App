import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Plus, Users as UsersIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { BalanceService, GroupService, formatMoney, type Group } from "@/lib/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Splitly" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ youOwe: 0, youAreOwed: 0 });
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [t, g] = await Promise.all([
          BalanceService.getMyTotals(),
          GroupService.listMine(),
        ]);
        setTotals(t);
        setGroups(g);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const net = totals.youAreOwed - totals.youOwe;

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold glow-text animate-text-glow tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your spending at a glance</p>
          </div>
          <Button asChild className="btn-gradient" id="dash-new-group-btn">
            <Link to="/groups">
              <Plus className="h-4 w-4" /> New
            </Link>
          </Button>
        </div>

        {/* Bento Stats */}
        <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 glass-strong rounded-[2rem] p-8 flex flex-col justify-between transition-all hover:shadow-glow relative overflow-hidden group animate-slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 pointer-events-none" />
            {/* Animated orb inside the hero card */}
            <div
              className="absolute -bottom-10 -right-10 h-[200px] w-[200px] rounded-full pointer-events-none opacity-20"
              style={{
                background: 'radial-gradient(circle, oklch(0.65 0.18 250 / 0.8) 0%, transparent 70%)',
                animation: 'blob-drift 8s ease-in-out infinite alternate',
                filter: 'blur(50px)',
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-base font-medium text-muted-foreground uppercase tracking-wider">Net Balance</p>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${net >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {net >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              </div>
            </div>
            <p className="mt-8 text-6xl font-bold tracking-tighter relative z-10 glow-text">
              {loading ? <span className="inline-block h-16 w-48 rounded bg-muted animate-pulse" /> : formatMoney(net)}
            </p>
          </div>

          <div className="flex flex-col gap-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <StatCard
              id="stat-owed"
              label="You are owed"
              value={formatMoney(totals.youAreOwed)}
              tone="success"
              icon={TrendingUp}
              loading={loading}
            />
            <StatCard
              id="stat-owe"
              label="You owe"
              value={formatMoney(totals.youOwe)}
              tone="destructive"
              icon={TrendingDown}
              loading={loading}
            />
          </div>
        </div>

        {/* Groups */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold glow-text">Your groups</h2>
            <Link to="/groups" id="dash-groups-link" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : groups.length === 0 ? (
            <div className="mt-6 glass rounded-[2rem] p-12 text-center border-dashed">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No groups yet</p>
              <Button asChild className="btn-gradient mt-6 rounded-full" id="dash-create-first-group">
                <Link to="/groups">Create your first group</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 6).map((g) => (
                <Link
                  key={g.id}
                  to="/groups/$groupId"
                  params={{ groupId: g.id }}
                  id={`dash-group-${g.id}`}
                  className="glass rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow flex flex-col justify-between"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient">
                    <UsersIcon className="h-5 w-5" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold">{g.name}</h3>
                    {g.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {g.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  id,
  label,
  value,
  tone,
  icon: Icon,
  loading,
}: {
  id: string;
  label: string;
  value: string;
  tone: "success" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <div id={id} className="glass rounded-[2rem] p-6 transition-all hover:shadow-glow flex-1 flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            tone === "success" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">
        {loading ? <span className="inline-block h-8 w-32 rounded bg-muted animate-pulse" /> : value}
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass rounded-2xl p-5">
          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          <div className="mt-4 h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="mt-2 h-4 w-full rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
