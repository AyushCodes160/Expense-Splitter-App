import { Router } from 'express';
import { getGroupBalances, getSimplifiedSettlements, recordSettlement } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/group/:groupId/balances', getGroupBalances);
router.get('/group/:groupId/simplified', getSimplifiedSettlements);
router.post('/pay', recordSettlement);

export default router;
