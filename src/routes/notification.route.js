const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../app/middlewares/auth');

const notificationController = require('../app/controllers/NotificationController');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/', auth, upload.single('imageURL'), notificationController.create);
router.get('/', notificationController.index);


module.exports = router;