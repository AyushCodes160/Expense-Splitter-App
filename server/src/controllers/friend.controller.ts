import { Response } from 'express';
import { FriendService } from '../services/friend.service';
import { AuthRequest } from '../middleware/auth';

export const getFriends = async (req: AuthRequest, res: Response) => {
  const friends = await FriendService.getFriends(req.user!.userId);
  res.json(friends);
};

export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  const requests = await FriendService.getPendingRequests(req.user!.userId);
  res.json(requests);
};

export const sendRequest = async (req: AuthRequest, res: Response) => {
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: 'friendId is required' });

  const request = await FriendService.sendFriendRequest(req.user!.userId, friendId);
  res.status(201).json(request);
};

export const acceptRequest = async (req: AuthRequest, res: Response) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: 'requestId is required' });

  const request = await FriendService.acceptFriendRequest(req.user!.userId, requestId);
  res.json(request);
};
