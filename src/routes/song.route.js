const express = require("express");
const router = express.Router();
const multer = require("multer");

const songController = require("../app/controllers/SongController");
const {
  getListenHistoryByUserID,
} = require("../app/middlewares/listenHistory");
const { getSongByGenre, getSongBySongID } = require("../app/middlewares/song");
const getGenreBySongID = require("../app/middlewares/genre");
const upload = multer();

router.get("/songSQL", songController.getSongFromSQLite);
router.get(
  "/recommend",
  getListenHistoryByUserID,
  getSongBySongID,
  getGenreBySongID,
  getSongByGenre,
  songController.getRecommendSongByUserID
);
router.get(
  "/recent",
  getListenHistoryByUserID,
  songController.getRecentSongByUserID
);
router.get("/nameAlbum", songController.getSongByAlbumName);
router.get("/nameArtist", songController.getSongByArtistName);
router.get("/nameGenre", songController.getSongByGenreName);
router.get("/songID", songController.getSongBySongID);
router.post("/", upload.single("songFile"), songController.create);
router.get("/", songController.index);

module.exports = router;
