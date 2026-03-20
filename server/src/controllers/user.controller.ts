import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await UserService.getUserById(userId);
  res.json(user);
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  const users = await UserService.searchUsers(query);
  res.json(users);
};
