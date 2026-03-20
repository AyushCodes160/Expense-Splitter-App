import { Router } from 'express';
import { sendRequest, acceptRequest, getFriends, getPendingRequests } from '../controllers/friend.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getFriends);
router.get('/pending', getPendingRequests);
router.post('/request', sendRequest);
router.put('/accept', acceptRequest);

export default router;
