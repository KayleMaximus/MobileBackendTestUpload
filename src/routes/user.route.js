const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../app/controllers/UserController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:userID', userController.getUserByID);
router.post('/', upload.single('imageURL'), userController.create);
router.patch('/:userID', userController.update);
router.delete('/:userID', userController.delete);
router.get('/', userController.index);

module.exports = router;