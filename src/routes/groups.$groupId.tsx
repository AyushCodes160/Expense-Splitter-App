import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  Wallet,
  UserPlus,
  Trash2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { SettleUpDialog } from "@/components/SettleUpDialog";
import {
  BalanceService,
  ExpenseService,
  GroupService,
  SettlementService,
  formatMoney,
  type Expense,
  type ExpenseSplit,
  type Group,
  type MemberBalance,
  type Profile,
  type Settlement,
} from "@/lib/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — Splitly" }] }),
  component: GroupDetailPage,
});

type ExpenseWithSplits = Expense & { expense_splits: ExpenseSplit[] };

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [g, m, e, b, s] = await Promise.all([
        GroupService.get(groupId),
        GroupService.getMembers(groupId),
        ExpenseService.listByGroup(groupId),
        BalanceService.getGroupBalances(groupId),
        SettlementService.listByGroup(groupId),
      ]);
      setGroup(g);
      setMembers(m);
      setExpenses(e as ExpenseWithSplits[]);
      setBalances(b);
      setSettlements(s);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load group");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!group) return <AppShell><p>Group not found</p></AppShell>;

  const myBalance = balances.find((b) => b.user_id === user?.id);
  const memberById = new Map(members.map((m) => [m.id, m]));

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <button
          onClick={() => navigate({ to: "/groups" })}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          id="back-to-groups"
        >
          <ArrowLeft className="h-4 w-4" /> All groups
        </button>

        {/* Header */}
        <div className="mt-4 glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-muted-foreground">{group.description}</p>
              )}
              <div className="mt-3 flex -space-x-2">
                {members.slice(0, 6).map((m) => (
                  <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-primary/20 text-xs text-primary">
                      {(m.full_name || m.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 6 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs">
                    +{members.length - 6}
                  </div>
                )}
              </div>
            </div>

            {myBalance && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your balance
                </p>
                <p
                  className={`mt-1 text-3xl font-bold ${
                    myBalance.net > 0
                      ? "text-success"
                      : myBalance.net < 0
                        ? "text-destructive"
                        : ""
                  }`}
                  id="my-group-balance"
                >
                  {myBalance.net > 0 ? "+" : ""}
                  {formatMoney(myBalance.net)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {myBalance.net > 0
                    ? "you are owed"
                    : myBalance.net < 0
                      ? "you owe"
                      : "all settled"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => setAddOpen(true)} className="btn-gradient" id="add-expense-btn">
              <Plus className="h-4 w-4" /> Add expense
            </Button>
            <Button
              onClick={() => setSettleOpen(true)}
              variant="outline"
              className="glass border-primary/30"
              id="settle-up-btn"
            >
              <Wallet className="h-4 w-4" /> Settle up
            </Button>
            <AddMemberDialog groupId={groupId} onAdded={load} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="mt-8">
          <TabsList className="glass">
            <TabsTrigger value="expenses" id="tab-expenses">
              <Receipt className="h-4 w-4 mr-1" /> Expenses
            </TabsTrigger>
            <TabsTrigger value="balances" id="tab-balances">
              <Wallet className="h-4 w-4 mr-1" /> Balances
            </TabsTrigger>
            <TabsTrigger value="members" id="tab-members">
              <Users className="h-4 w-4 mr-1" /> Members
            </TabsTrigger>
            <TabsTrigger value="history" id="tab-history">
              <Calendar className="h-4 w-4 mr-1" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-4">
            {expenses.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses yet" desc="Add your first expense to start tracking." />
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => {
                  const payer = memberById.get(e.paid_by);
                  const isMine = e.paid_by === user?.id;
                  const myShare = e.expense_splits.find((s) => s.user_id === user?.id);
                  return (
                    <div
                      key={e.id}
                      className="glass rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-muted/30"
                      id={`expense-${e.id}`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {payer?.full_name || payer?.username || "Someone"} paid ·{" "}
                          {new Date(e.date).toLocaleDateString()} · {e.split_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatMoney(Number(e.amount))}</p>
                        {myShare && (
                          <p
                            className={`text-xs ${
                              isMine ? "text-success" : "text-destructive"
                            }`}
                          >
                            {isMine ? "you lent " : "you owe "}
                            {formatMoney(
                              isMine
                                ? Number(e.amount) - Number(myShare.amount_owed)
                                : Number(myShare.amount_owed),
                            )}
                          </p>
                        )}
                      </div>
                      {isMine && (
                        <Button
                          variant="ghost"
                          size="icon"
                          id={`del-expense-${e.id}`}
                          onClick={async () => {
                            if (!confirm("Delete this expense?")) return;
                            await ExpenseService.delete(e.id);
                            toast.success("Expense deleted");
                            load();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances" className="mt-4 space-y-2">
            {balances.map((b) => (
              <div
                key={b.user_id}
                className="glass rounded-xl p-4 flex items-center justify-between"
                id={`bal-${b.user_id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {(b.full_name || b.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {b.user_id === user?.id ? "You" : b.full_name || b.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{b.username}</p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    b.net > 0 ? "text-success" : b.net < 0 ? "text-destructive" : ""
                  }`}
                >
                  {b.net > 0 ? "+" : ""}
                  {formatMoney(b.net)}
                </p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="members" className="mt-4 space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
                id={`mem-${m.id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {(m.full_name || m.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {m.full_name || m.username} {m.id === group.created_by && "· owner"}
                    </p>
                    <p className="text-xs text-muted-foreground">@{m.username}</p>
                  </div>
                </div>
                {group.created_by === user?.id && m.id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    id={`remove-mem-${m.id}`}
                    onClick={async () => {
                      if (!confirm(`Remove ${m.username}?`)) return;
                      await GroupService.removeMember(groupId, m.id);
                      toast.success("Member removed");
                      load();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-2">
            {settlements.length === 0 ? (
              <EmptyState icon={Calendar} title="No settlements yet" desc="Records of payments between members will show here." />
            ) : (
              settlements.map((s) => {
                const payer = memberById.get(s.payer_id);
                const payee = memberById.get(s.payee_id);
                return (
                  <div
                    key={s.id}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                    id={`settle-${s.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {payer?.username || "?"} paid {payee?.username || "?"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatMoney(Number(s.amount))}</p>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <AddExpenseDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          groupId={groupId}
          members={members}
          onAdded={load}
        />
        <SettleUpDialog
          open={settleOpen}
          onOpenChange={setSettleOpen}
          groupId={groupId}
          members={members}
          onSettled={load}
        />
      </div>
    </AppShell>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-4 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function AddMemberDialog({ groupId, onAdded }: { groupId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState("");
  const [adding, setAdding] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      import("@/lib/services").then((s) => s.FriendService.getFriends()).then(setFriends);
    }
  }, [open]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const { GroupService } = await import("@/lib/services");
      await GroupService.addMember(groupId, friendId);
      toast.success("Member added");
      setFriendId("");
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="glass" id="add-member-btn">
          <UserPlus className="h-4 w-4" /> Add member
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4 mt-2" id="add-member-form">
          <div className="space-y-2">
            <Label htmlFor="add-member-friend">Select Friend</Label>
            <select
              id="add-member-friend"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              required
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select a friend</option>
              {friends.map(f => (
                <option key={f.friendshipId} value={f.id}>{f.username}</option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            disabled={adding || !friendId}
            className="btn-gradient w-full h-11"
            id="add-member-submit"
          >
            {adding ? "Adding..." : "Add member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
