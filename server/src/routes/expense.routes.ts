import { Router } from 'express';
import { addExpense, getGroupExpenses } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', addExpense);
router.get('/group/:groupId', getGroupExpenses);

export default router;
