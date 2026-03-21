import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BalanceService,
  SettlementService,
  formatMoney,
  type Profile,
} from "@/lib/services";
import type { SettlementTxn } from "@/lib/settlement";
import { useAuth } from "@/lib/auth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupId: string;
  members: Profile[];
  onSettled: () => void;
}

export function SettleUpDialog({ open, onOpenChange, groupId, members, onSettled }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [txns, setTxns] = useState<SettlementTxn[]>([]);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    BalanceService.getSimplifiedSettlements(groupId)
      .then(({ txns }) => setTxns(txns))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [open, groupId]);

  const memberById = new Map(members.map((m) => [m.id, m]));

  async function recordPayment(t: SettlementTxn, idx: number) {
    setPaying(`${idx}`);
    try {
      await SettlementService.record(groupId, t.payee_id, t.amount);
      toast.success("Payment recorded");
      // Refresh
      const { txns: fresh } = await BalanceService.getSimplifiedSettlements(groupId);
      setTxns(fresh);
      onSettled();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setPaying(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Smart settle up
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          The smallest set of payments to settle everyone up.
        </p>

        {loading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : txns.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-success" />
            <p className="mt-4 font-semibold">All settled up! 🎉</p>
            <p className="text-sm text-muted-foreground">No outstanding balances.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {txns.map((t, i) => {
              const payer = memberById.get(t.payer_id);
              const payee = memberById.get(t.payee_id);
              const isMyPayment = t.payer_id === user?.id;
              return (
                <div
                  key={i}
                  className="glass rounded-xl p-4 flex items-center justify-between gap-3"
                  id={`txn-${i}`}
                >
                  <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                    <span className="font-medium truncate">
                      {payer?.id === user?.id ? "You" : payer?.full_name || payer?.username}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">
                      {payee?.id === user?.id ? "You" : payee?.full_name || payee?.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold tabular-nums">{formatMoney(t.amount)}</span>
                    {isMyPayment && (
                      <Button
                        size="sm"
                        className="btn-gradient"
                        disabled={paying === `${i}`}
                        onClick={() => recordPayment(t, i)}
                        id={`pay-btn-${i}`}
                      >
                        {paying === `${i}` ? "..." : "Pay"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
