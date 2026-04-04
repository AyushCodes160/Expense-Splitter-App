import { Router } from 'express';
import { getMe, searchUsers, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateProfile);
router.get('/search', searchUsers);

export default router;
