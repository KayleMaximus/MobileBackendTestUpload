const express = require('express');
const router = express.Router();

const listenHistoryController = require('../app/controllers/ListenHistoryController');
const {checkHistoryExist} = require('../app/middlewares/listenHistory');

router.get('/getSongLove', listenHistoryController.getSongLoveByUserID);
router.get('/getListenHistory', listenHistoryController.getListenHistoryByUserID);
router.post('/', checkHistoryExist);
router.get('/',  listenHistoryController.index);

module.exports = router;


