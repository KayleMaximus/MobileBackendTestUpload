const express = require('express');
const router = express.Router();

const notificationController = require('../app/controllers/NotificationController');

router.post('/create', notificationController.create);
router.get('/', notificationController.index);


module.exports = router;