const express = require('express');
const router = express.Router();
const multer = require('multer');

const notificationController = require('../app/controllers/NotificationController');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/', upload.single('imageURL'), notificationController.create);
router.get('/', notificationController.index);


module.exports = router;