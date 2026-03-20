import { Router } from 'express';
import { createGroup, listMyGroups, getGroupDetails, addMember } from '../controllers/group.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', listMyGroups);
router.post('/', createGroup);
router.get('/:id', getGroupDetails);
router.post('/:id/members', addMember);

export default router;
