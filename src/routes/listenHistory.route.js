const express = require('express');
const router = express.Router();

const listenHistoryController = require('../app/controllers/ListenHistoryController');
const listenHistory = require('../app/middlewares/listenHistory');

router.patch('/updateIsLove', listenHistoryController.updateIsLove);
router.get('/bothID', listenHistoryController.getHistoryByUserIDAndSongID);
router.get('/userID', listenHistoryController.getHistoryByUserID);
router.get('/',  listenHistoryController.index);
router.post('/', listenHistory);

module.exports = router;


