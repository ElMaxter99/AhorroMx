const express = require('express');
const contributionController = require('../controllers/contribution');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, contributionController.create);

router.get('/:contributionId', authMiddleware, contributionController.getById);

router.get('/', authMiddleware, contributionController.getList);
router.get('/user/:userId', authMiddleware, contributionController.getListByUser);
router.get('/user/:userId/group/:groupId', authMiddleware, contributionController.getListByUserAndGroup);
router.get('/group/:groupId', authMiddleware, contributionController.getListByGroup);
router.get('/expense/:expenseId', authMiddleware, contributionController.getListByExpense);

router.delete('/:contributionId', authMiddleware, contributionController.delete);

router.put('/:contributionId', authMiddleware, contributionController.update);
router.put('/status/:contributionId', authMiddleware, contributionController.updateStatus);

module.exports = router;
