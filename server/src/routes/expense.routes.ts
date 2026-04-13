import { Router } from 'express';
import { addExpense, getGroupExpenses, deleteExpense, getMyExpenses } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', addExpense);
router.get('/me', getMyExpenses);
router.get('/group/:groupId', getGroupExpenses);
router.delete('/:id', deleteExpense);

export default router;
