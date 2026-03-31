import { Router } from 'express';
import { getGroupBalances, getSimplifiedSettlements, recordSettlement, getMyTotals } from '../controllers/settlement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me/balances', getMyTotals);
router.get('/group/:groupId/balances', getGroupBalances);
router.get('/group/:groupId/simplified', getSimplifiedSettlements);
router.post('/pay', recordSettlement);

export default router;
