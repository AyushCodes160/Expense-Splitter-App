import { prisma } from '../config/db';
import { simplifyDebts } from './settlement';

export interface MemberBalance {
  user_id: string;
  username: string;
  net: number;
}

export class SettlementService {
  static async getGroupBalances(groupId: string): Promise<MemberBalance[]> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { user: true } },
        expenses: { include: { splits: true } },
        settlements: true
      }
    });

    if (!group) throw new Error("Group not found");

    const net = new Map<string, number>(group.members.map(m => [m.userId, 0]));

    for (const e of group.expenses) {
      net.set(e.paidBy, (net.get(e.paidBy) ?? 0) + e.amount);
      for (const s of e.splits) {
        net.set(s.userId, (net.get(s.userId) ?? 0) - s.amountOwed);
      }
    }

    for (const s of group.settlements) {
      net.set(s.payerId, (net.get(s.payerId) ?? 0) + s.amount);
      net.set(s.payeeId, (net.get(s.payeeId) ?? 0) - s.amount);
    }

    return group.members.map(m => ({
      user_id: m.userId,
      username: m.user.username,
      net: Math.round((net.get(m.userId) ?? 0) * 100) / 100
    }));
  }

  static async getSimplifiedSettlements(groupId: string) {
    const balances = await this.getGroupBalances(groupId);
    const txns = simplifyDebts(balances.map(b => ({ user_id: b.user_id, net: b.net })));
    
    // Attach username for UI convenience
    const txnsWithNames = txns.map(t => {
      const fromUser = balances.find(b => b.user_id === t.payer_id)?.username;
      const toUser = balances.find(b => b.user_id === t.payee_id)?.username;
      return { ...t, fromUsername: fromUser, toUsername: toUser };
    });

    return { txns: txnsWithNames, balances };
  }

  static async recordSettlement(payerId: string, payeeId: string, groupId: string, amount: number) {
    return prisma.settlement.create({
      data: {
        groupId,
        payerId,
        payeeId,
        amount,
        status: 'completed'
      }
    });
  }

  static async getMyTotals(userId: string) {
    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      select: { groupId: true }
    });

    let youOwe = 0;
    let youAreOwed = 0;

    for (const { groupId } of userGroups) {
      const balances = await this.getGroupBalances(groupId);
      const myBalance = balances.find(b => b.user_id === userId);
      if (myBalance) {
        if (myBalance.net > 0) youAreOwed += myBalance.net;
        else if (myBalance.net < 0) youOwe += Math.abs(myBalance.net);
      }
    }

    return {
      youOwe: Math.round(youOwe * 100) / 100,
      youAreOwed: Math.round(youAreOwed * 100) / 100
    };
  }

  static async getMySettlements(userId: string) {
    return prisma.settlement.findMany({
      where: {
        OR: [
          { payerId: userId },
          { payeeId: userId }
        ]
      },
      include: {
        group: { select: { id: true, name: true } },
        payer: { select: { id: true, username: true, avatarUrl: true } },
        payee: { select: { id: true, username: true, avatarUrl: true } }
      },
      orderBy: { date: 'desc' }
    });
  }
}
