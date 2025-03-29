const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category');

router.post('/', categoryController.create);

router.get('/:categoryId', categoryController.getById);

router.get('/', categoryController.getList);

router.delete('/:categoryId', categoryController.delete);

router.put('/:categoryId', categoryController.update);
router.put('/name/:categoryId', categoryController.updateName);
router.put('/description/:categoryId', categoryController.updateDescription);
router.put('/path-emoji-icon/:categoryId', categoryController.updatePathEmojiIcon);
router.put('/active/:categoryId', categoryController.updateActive);

module.exports = router;
