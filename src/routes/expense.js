const express = require('express');
const expenseController = require('../controllers/expense');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, expenseController.create);

router.get('/:expenseId', authMiddleware, expenseController.getById);

router.get('/', authMiddleware, expenseController.getList);
router.get('/group/:groupId', authMiddleware, expenseController.getListByGroup);
router.get('/user/:groupId', authMiddleware, expenseController.getListByUser);

router.delete('/:expenseId', authMiddleware, expenseController.delete);

router.put('/:expenseId', authMiddleware, expenseController.update);

module.exports = router;
