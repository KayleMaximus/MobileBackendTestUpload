const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../app/controllers/UserController');
const auth = require('../app/middlewares/auth')
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:userID', userController.getUserByID);
router.post('/', userController.create);
router.patch('/:userID', userController.update);
router.delete('/:userID', userController.delete);
router.get('/',auth,  userController.index);

module.exports = router;