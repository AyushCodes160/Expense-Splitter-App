import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { ExpenseService, SettlementService, formatMoney } from "@/lib/services";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Wallet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity — Splitly" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      ExpenseService.listMine(),
      SettlementService.listMine()
    ]).then(([e, s]) => {
      setExpenses(e);
      setSettlements(s);
      setLoading(false);
    });
  }, [user]);

  // Combine and sort chronologically
  const timeline = useMemo(() => {
    const items = [
      ...expenses.map(e => ({ type: 'expense', date: new Date(e.date).getTime(), data: e })),
      ...settlements.map(s => ({ type: 'settlement', date: new Date(s.date).getTime(), data: s }))
    ];
    items.sort((a, b) => b.date - a.date);
    return items;
  }, [expenses, settlements]);

  // Filter based on search (Group name or description)
  const filteredTimeline = useMemo(() => {
    const q = search.toLowerCase();
    return timeline.filter(item => {
      const gName = item.data.group?.name?.toLowerCase() || "";
      if (item.type === 'expense') {
        const desc = item.data.description?.toLowerCase() || "";
        return gName.includes(q) || desc.includes(q);
      } else {
        const payer = item.data.payer?.username?.toLowerCase() || "";
        const payee = item.data.payee?.username?.toLowerCase() || "";
        return gName.includes(q) || payer.includes(q) || payee.includes(q);
      }
    });
  }, [timeline, search]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-in-up max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Activity History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review all your expenses and settlements across every group.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList className="glass">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="settlements">Settlements</TabsTrigger>
            </TabsList>

            <div className="mt-6 w-full relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by group, description, or username..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 w-full md:w-96"
              />
            </div>

            <div className="mt-6 space-y-3">
              <TabsContent value="all" className="mt-0 space-y-3">
                {filteredTimeline.length === 0 ? <p className="text-muted-foreground">No activity found.</p> : null}
                {filteredTimeline.map((item, i) => (
                  <ActivityCard key={i} item={item} user={user!} />
                ))}
              </TabsContent>
              <TabsContent value="expenses" className="mt-0 space-y-3">
                {filteredTimeline.filter(i => i.type === 'expense').map((item, i) => (
                  <ActivityCard key={i} item={item} user={user!} />
                ))}
              </TabsContent>
              <TabsContent value="settlements" className="mt-0 space-y-3">
                {filteredTimeline.filter(i => i.type === 'settlement').map((item, i) => (
                  <ActivityCard key={i} item={item} user={user!} />
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}

function ActivityCard({ item, user }: { item: any, user: any }) {
  if (item.type === 'expense') {
    const e = item.data;
    const isPayer = e.paidBy === user.id;
    const mySplit = e.splits?.find((s: any) => s.userId === user.id);
    const amount = Number(e.amount);

    return (
      <div className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-muted/30 transition-all">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
          <Receipt className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{e.description}</p>
          <p className="text-xs text-muted-foreground">
            {e.group?.name} • {new Date(e.date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold">{formatMoney(amount)}</p>
          {mySplit && (
            <p className={`text-xs ${isPayer ? "text-success" : "text-destructive"}`}>
              {isPayer ? "You lent " : "You borrowed "}
              {formatMoney(isPayer ? amount - Number(mySplit.amountOwed) : Number(mySplit.amountOwed))}
            </p>
          )}
        </div>
      </div>
    );
  } else {
    const s = item.data;
    const isPayer = s.payerId === user.id;
    const amount = Number(s.amount);
    
    return (
      <div className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-muted/30 transition-all">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/15 text-success shrink-0">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {isPayer ? "You" : s.payer?.username} paid {isPayer ? s.payee?.username : "You"}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.group?.name} • {new Date(s.date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-success">{formatMoney(amount)}</p>
        </div>
      </div>
    );
  }
}
