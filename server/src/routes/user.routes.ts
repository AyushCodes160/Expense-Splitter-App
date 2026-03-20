import { Router } from 'express';
import { getMe, searchUsers } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.get('/search', searchUsers);

export default router;
