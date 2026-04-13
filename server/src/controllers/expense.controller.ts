import { Response } from 'express';
import { ExpenseService } from '../services/expense.service';
import { AuthRequest } from '../middleware/auth';

export const addExpense = async (req: AuthRequest, res: Response) => {
  const expense = await ExpenseService.addExpense(req.user!.userId, req.body);
  res.status(201).json(expense);
};

export const getGroupExpenses = async (req: AuthRequest, res: Response) => {
  const expenses = await ExpenseService.getGroupExpenses(req.params.groupId as string);
  res.json(expenses);
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    await ExpenseService.deleteExpense(req.user!.userId, req.params.id as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export const getMyExpenses = async (req: AuthRequest, res: Response) => {
  const expenses = await ExpenseService.getMyExpenses(req.user!.userId);
  res.json(expenses);
};
