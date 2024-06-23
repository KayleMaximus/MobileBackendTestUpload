const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../app/controllers/UserController');
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth')
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:userID', userController.getUserByID);
router.post('/', userController.create);
router.patch('/:userID', upload.single('imageURL'), userController.update);
router.delete('/:userID', userController.delete);
router.get('/', cache.cacheAllUsers, userController.index);

module.exports = router;