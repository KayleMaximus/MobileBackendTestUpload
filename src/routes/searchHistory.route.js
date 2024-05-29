const express = require('express');
const router = express.Router();


const searchHistoryController = require('../app/controllers/SearchHistoryController');
const searchHistory = require('../app/middlewares/searchHistory');


router.get('/:userID', searchHistoryController.getHistoryByUserID);
router.get('/', searchHistoryController.index);
router.post('/', searchHistory);

module.exports = router;
