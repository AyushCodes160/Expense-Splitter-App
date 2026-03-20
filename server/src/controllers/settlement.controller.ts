import { Response } from 'express';
import { SettlementService } from '../services/settlement.service';
import { AuthRequest } from '../middleware/auth';

export const getGroupBalances = async (req: AuthRequest, res: Response) => {
  const balances = await SettlementService.getGroupBalances(req.params.groupId as string);
  res.json(balances);
};

export const getSimplifiedSettlements = async (req: AuthRequest, res: Response) => {
  const data = await SettlementService.getSimplifiedSettlements(req.params.groupId as string);
  res.json(data);
};

export const recordSettlement = async (req: AuthRequest, res: Response) => {
  const { groupId, payeeId, amount } = req.body;
  if (!groupId || !payeeId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const settlement = await SettlementService.recordSettlement(req.user!.userId, payeeId, groupId, amount);
  res.status(201).json(settlement);
};
