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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your spending at a glance</p>
          </div>
          <Button asChild className="btn-gradient" id="dash-new-group-btn">
            <Link to="/groups">
              <Plus className="h-4 w-4" /> New
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            id="stat-net"
            label="Net balance"
            value={formatMoney(net)}
            tone={net >= 0 ? "success" : "destructive"}
            icon={net >= 0 ? TrendingUp : TrendingDown}
            loading={loading}
          />
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

        {/* Groups */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your groups</h2>
            <Link to="/groups" id="dash-groups-link" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : groups.length === 0 ? (
            <div className="mt-4 glass rounded-2xl p-12 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No groups yet</p>
              <Button asChild className="btn-gradient mt-4" id="dash-create-first-group">
                <Link to="/groups">Create your first group</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 6).map((g) => (
                <Link
                  key={g.id}
                  to="/groups/$groupId"
                  params={{ groupId: g.id }}
                  id={`dash-group-${g.id}`}
                  className="glass rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-glow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg btn-gradient">
                    <UsersIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{g.name}</h3>
                  {g.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {g.description}
                    </p>
                  )}
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
    <div id={id} className="glass rounded-2xl p-6 transition-all hover:shadow-glow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            tone === "success" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">
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
