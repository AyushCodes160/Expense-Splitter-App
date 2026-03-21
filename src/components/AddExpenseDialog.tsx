import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseService, formatMoney, type Profile } from "@/lib/services";
import type { SplitTypeKey } from "@/lib/strategies/SplitStrategy";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupId: string;
  members: Profile[];
  onAdded: () => void;
}

export function AddExpenseDialog({ open, onOpenChange, groupId, members, onAdded }: Props) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [splitType, setSplitType] = useState<SplitTypeKey>("equal");
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [shares, setShares] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize all members selected when opened
  useEffect(() => {
    if (open) {
      setParticipants(new Set(members.map((m) => m.id)));
      setShares({});
      setAmount("");
      setDescription("");
      setSplitType("equal");
    }
  }, [open, members]);

  const numAmount = parseFloat(amount) || 0;
  const participantIds = Array.from(participants);

  const sharesValid = useMemo(() => {
    if (splitType === "equal") return true;
    const total = participantIds.reduce(
      (s, id) => s + (parseFloat(shares[id] || "0") || 0),
      0,
    );
    if (splitType === "unequal") return Math.abs(total - numAmount) < 0.01;
    return Math.abs(total - 100) < 0.01;
  }, [splitType, shares, participantIds, numAmount]);

  function toggleParticipant(id: string) {
    setParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (participantIds.length === 0) {
      toast.error("Select at least one participant");
      return;
    }
    if (!sharesValid) {
      toast.error(
        splitType === "percentage"
          ? "Percentages must sum to 100"
          : "Amounts must sum to total",
      );
      return;
    }

    setSubmitting(true);
    try {
      const sharesNum: Record<string, number> = {};
      if (splitType !== "equal") {
        for (const id of participantIds) {
          sharesNum[id] = parseFloat(shares[id] || "0") || 0;
        }
      }
      await ExpenseService.add({
        groupId,
        amount: numAmount,
        description,
        date: new Date(date).toISOString(),
        splitType,
        participantIds,
        shares: splitType !== "equal" ? sharesNum : undefined,
      });
      toast.success("Expense added");
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2" id="add-expense-form">
          <div className="space-y-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Input
              id="exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Dinner at Sushi Place"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-split">Split type</Label>
            <Select value={splitType} onValueChange={(v) => setSplitType(v as SplitTypeKey)}>
              <SelectTrigger id="exp-split" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal — split evenly</SelectItem>
                <SelectItem value="unequal">Unequal — set exact amounts</SelectItem>
                <SelectItem value="percentage">Percentage — by share %</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="space-y-2 rounded-xl border border-border p-3 max-h-64 overflow-y-auto">
              {members.map((m) => {
                const checked = participants.has(m.id);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`part-${m.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleParticipant(m.id)}
                    />
                    <label
                      htmlFor={`part-${m.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium"
                    >
                      {m.full_name || m.username}
                    </label>
                    {checked && splitType !== "equal" && (
                      <Input
                        id={`share-${m.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={shares[m.id] ?? ""}
                        onChange={(e) =>
                          setShares((p) => ({ ...p, [m.id]: e.target.value }))
                        }
                        placeholder={splitType === "percentage" ? "%" : "$"}
                        className="h-8 w-24 text-right"
                      />
                    )}
                    {checked && splitType === "equal" && numAmount > 0 && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatMoney(numAmount / participantIds.length)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {splitType !== "equal" && (
              <p className={`text-xs ${sharesValid ? "text-muted-foreground" : "text-destructive"}`}>
                {splitType === "percentage"
                  ? `Sum: ${participantIds.reduce((s, id) => s + (parseFloat(shares[id] || "0") || 0), 0).toFixed(2)}% / 100%`
                  : `Sum: ${formatMoney(participantIds.reduce((s, id) => s + (parseFloat(shares[id] || "0") || 0), 0))} / ${formatMoney(numAmount)}`}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="btn-gradient w-full h-11"
            id="add-expense-submit"
          >
            {submitting ? "Adding..." : "Add expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
