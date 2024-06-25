const express = require("express");
const router = express.Router();

const listenHistoryController = require("../app/controllers/ListenHistoryController");
const {
  checkHistoryExist,
  getListSongIDLoveByUserID,
  getListenHistoryByUserID,
  getListenHistoryByUserID_History
} = require("../app/middlewares/listenHistory");

router.get(
  "/getSongLove",
  getListSongIDLoveByUserID,
  listenHistoryController.getSongLoveByUserID
);
router.get(
  "/getListenHistory",
  getListenHistoryByUserID_History,
  listenHistoryController.getListenHistoryByUserID
);

router.post("/createMultipleHistory", listenHistoryController.createMultipleHistory);
router.post("/", checkHistoryExist);
router.get("/", listenHistoryController.index);

module.exports = router;
