const express = require('express');
const movementController = require('../controllers/movement');
// const authMiddleware = require('../middlewares/authMiddleware'); // TODO

const router = express.Router();

router.post('/', movementController.create);

router.get('/:movementId', movementController.getById);

router.get('/', movementController.getList);
router.get('/user/:userId', movementController.getListByUser);
router.get('/user/:userId/category/:categoryId', movementController.getListByUserAndCategory);

router.delete('/:movementId', movementController.delete);

router.put('/:movementId', movementController.update);
router.put('/category/:movementId', movementController.updateCategory);
router.put('/type/:movementId', movementController.updateType);

module.exports = router;
