const express = require('express');
const contributionController = require('../controllers/contribution');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, contributionController.create);

router.get('/:contributionId', authMiddleware, contributionController.getById);

router.delete('/:contributionId', authMiddleware, contributionController.delete);

router.put('/:contributionId', authMiddleware, contributionController.update);
router.put('/status/:status', authMiddleware, contributionController.updateStatus);

router.get('/', authMiddleware, contributionController.getList);
router.get('/user/:userId', authMiddleware, contributionController.getListByUser);
router.get('/group/:groupId', authMiddleware, contributionController.getListByGroup);
router.get('/usergroup/:userId/:groupId', authMiddleware, contributionController.getListByUserAndGroup);
router.get('/expense/:expenseId', authMiddleware, contributionController.getListByExpense);

module.exports = router;
