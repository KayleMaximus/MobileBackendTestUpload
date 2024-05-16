const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.get('/:userID', userController.getUserByID);
router.post('/', userController.create);
router.patch('/:userID', userController.update);
router.delete('/:userID', userController.delete);
router.get('/', userController.index);

module.exports = router;