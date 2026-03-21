/**
 * Strategy Pattern — split calculation
 * Base abstraction + 3 concrete strategies (equal, unequal, percentage).
 */

export interface SplitInput {
  amount: number;
  participants: string[]; // user ids
  /** For unequal: map userId -> exact amount.
   *  For percentage: map userId -> percentage (0-100). */
  shares?: Record<string, number>;
}

export interface SplitResult {
  user_id: string;
  amount_owed: number;
}

export abstract class SplitStrategy {
  abstract calculate(input: SplitInput): SplitResult[];

  protected round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}

/** Even split across all participants. Last person absorbs rounding diff. */
export class EqualSplitStrategy extends SplitStrategy {
  calculate({ amount, participants }: SplitInput): SplitResult[] {
    if (participants.length === 0) return [];
    const share = this.round2(amount / participants.length);
    const result = participants.map((user_id) => ({ user_id, amount_owed: share }));
    // Adjust last to account for floating-point drift
    const total = result.reduce((s, r) => s + r.amount_owed, 0);
    const diff = this.round2(amount - total);
    if (diff !== 0 && result.length > 0) {
      result[result.length - 1].amount_owed = this.round2(
        result[result.length - 1].amount_owed + diff,
      );
    }
    return result;
  }
}

/** User specifies exact amount per participant. Must sum to total. */
export class UnequalSplitStrategy extends SplitStrategy {
  calculate({ amount, participants, shares }: SplitInput): SplitResult[] {
    if (!shares) throw new Error("UnequalSplitStrategy requires shares map");
    const total = participants.reduce((s, uid) => s + (shares[uid] ?? 0), 0);
    if (Math.abs(total - amount) > 0.01) {
      throw new Error(`Split amounts (${total}) must equal expense total (${amount})`);
    }
    return participants.map((user_id) => ({
      user_id,
      amount_owed: this.round2(shares[user_id] ?? 0),
    }));
  }
}

/** User specifies percentage per participant. Must sum to 100. */
export class PercentageSplitStrategy extends SplitStrategy {
  calculate({ amount, participants, shares }: SplitInput): SplitResult[] {
    if (!shares) throw new Error("PercentageSplitStrategy requires shares map");
    const totalPct = participants.reduce((s, uid) => s + (shares[uid] ?? 0), 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100 (got ${totalPct})`);
    }
    const result = participants.map((user_id) => ({
      user_id,
      amount_owed: this.round2(amount * ((shares[user_id] ?? 0) / 100)),
    }));
    // Absorb rounding into last share
    const sum = result.reduce((s, r) => s + r.amount_owed, 0);
    const diff = this.round2(amount - sum);
    if (diff !== 0 && result.length > 0) {
      result[result.length - 1].amount_owed = this.round2(
        result[result.length - 1].amount_owed + diff,
      );
    }
    return result;
  }
}

export type SplitTypeKey = "equal" | "unequal" | "percentage";

/** Factory — selects the right strategy for a split type. */
export function getSplitStrategy(type: SplitTypeKey): SplitStrategy {
  switch (type) {
    case "equal":
      return new EqualSplitStrategy();
    case "unequal":
      return new UnequalSplitStrategy();
    case "percentage":
      return new PercentageSplitStrategy();
    default:
      throw new Error(`Unknown split type: ${type}`);
  }
}
