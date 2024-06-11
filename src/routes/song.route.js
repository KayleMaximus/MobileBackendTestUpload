const express = require("express");
const router = express.Router();
const multer = require("multer");

const songController = require("../app/controllers/SongController");
const {
  getListenHistoryByUserID,
  getListenHistoryByUserID_Forgotten,
} = require("../app/middlewares/listenHistory");
const {
  getSongByGenre,
  getSongBySongID,
  handleForgotten,
} = require("../app/middlewares/song");
const getGenreBySongID = require("../app/middlewares/genre");
const upload = multer();

router.get("/songSQL", songController.getSongFromSQLite);
router.get(
  "/forgotten",
  getListenHistoryByUserID_Forgotten,
  getSongBySongID,
  handleForgotten,
  songController.getForgotenFavoriteSongByUserID
);
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
router.get("/songName", songController.getSongBySongName);
router.post("/", upload.single("songFile"), songController.create);
router.delete('/:songID', songController.delete);
router.get("/", songController.index);

module.exports = router;
