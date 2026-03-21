/**
 * Smart settlement — greedy debt simplification.
 * Given net balances per user, returns the minimum-ish list of
 * (payer -> payee, amount) transactions needed to settle.
 */

export interface UserBalance {
  user_id: string;
  /** Positive = is owed money. Negative = owes money. */
  net: number;
}

export interface SettlementTxn {
  payer_id: string; // owes
  payee_id: string; // receives
  amount: number;
}

export function simplifyDebts(balances: UserBalance[]): SettlementTxn[] {
  const EPS = 0.01;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  // Clone and split
  const creditors = balances
    .filter((b) => b.net > EPS)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((b) => b.net < -EPS)
    .map((b) => ({ ...b, net: -b.net })) // make positive (amount owed)
    .sort((a, b) => b.net - a.net);

  const txns: SettlementTxn[] = [];

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amt = round2(Math.min(debtor.net, creditor.net));

    if (amt > EPS) {
      txns.push({
        payer_id: debtor.user_id,
        payee_id: creditor.user_id,
        amount: amt,
      });
    }

    debtor.net = round2(debtor.net - amt);
    creditor.net = round2(creditor.net - amt);

    if (debtor.net <= EPS) i++;
    if (creditor.net <= EPS) j++;
  }

  return txns;
}
