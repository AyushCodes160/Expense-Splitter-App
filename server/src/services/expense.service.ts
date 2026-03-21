import { prisma } from '../config/db';
import { getSplitStrategy, SplitTypeKey } from './SplitStrategy';

export interface AddExpenseInput {
  groupId: string;
  amount: number;
  description: string;
  splitType: SplitTypeKey;
  participantIds: string[];
  shares?: Record<string, number>;
}

export class ExpenseService {
  static async addExpense(userId: string, input: AddExpenseInput) {
    const strategy = getSplitStrategy(input.splitType);
    const splits = strategy.calculate({
      amount: input.amount,
      participants: input.participantIds,
      shares: input.shares,
    });

    const expense = await prisma.expense.create({
      data: {
        groupId: input.groupId,
        paidBy: userId,
        amount: input.amount,
        description: input.description,
        splitType: input.splitType,
        splits: {
          create: splits.map((s) => ({
            userId: s.user_id,
            amountOwed: s.amount_owed,
          }))
        }
      },
      include: {
        splits: true
      }
    });

    return expense;
  }

  static async getGroupExpenses(groupId: string) {
    return prisma.expense.findMany({
      where: { groupId },
      include: {
        splits: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } }
          }
        },
        payer: { select: { id: true, username: true, avatarUrl: true } }
      },
      orderBy: { date: 'desc' }
    });
  }
}
