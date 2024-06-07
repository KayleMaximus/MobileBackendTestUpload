const express = require("express");
const router = express.Router();

const listenHistoryController = require("../app/controllers/ListenHistoryController");
const {
  checkHistoryExist,
  getListSongIDLoveByUserID,
  getListenHistoryByUserID,
} = require("../app/middlewares/listenHistory");

router.get(
  "/getSongLove",
  getListSongIDLoveByUserID,
  listenHistoryController.getSongLoveByUserID
);
router.get(
  "/getListenHistory",
  getListenHistoryByUserID,
  listenHistoryController.getListenHistoryByUserID
);
router.post("/", checkHistoryExist);
router.get("/", listenHistoryController.index);

module.exports = router;
