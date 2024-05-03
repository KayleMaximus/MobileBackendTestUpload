const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/UserController');

router.post('/create', userController.create);
router.patch('/update', userController.update);
router.get('/', userController.index);

module.exports = router;