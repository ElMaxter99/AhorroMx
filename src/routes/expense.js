const express = require('express');
const expenseController = require('../controllers/expense');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, expenseController.createExpense);
// router.get('/', authMiddleware, expenseController.getExpenses);
router.get('/:expenseId', authMiddleware, expenseController.getExpenseById);
router.put('/:expenseId', authMiddleware, expenseController.updateExpense);
router.delete('/:expenseId', authMiddleware, expenseController.deleteExpense);

module.exports = router;
