import { Response } from 'express';
import { GroupService } from '../services/group.service';
import { AuthRequest } from '../middleware/auth';

export const listMyGroups = async (req: AuthRequest, res: Response) => {
  const groups = await GroupService.listUserGroups(req.user!.userId);
  res.json(groups);
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const group = await GroupService.createGroup(req.user!.userId, name, description);
  res.status(201).json(group);
};

export const getGroupDetails = async (req: AuthRequest, res: Response) => {
  const group = await GroupService.getGroupDetails(req.params.id as string);
  res.json(group);
};

export const addMember = async (req: AuthRequest, res: Response) => {
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: 'friendId is required' });

  await GroupService.addMember(req.params.id as string, friendId);
  res.json({ message: 'Member added' });
};
