const express = require("express");
const router = express.Router();
const multer = require("multer");

const songController = require("../app/controllers/SongController");
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth');
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
router.post("/", auth, upload.single("songFile"), songController.create);
router.patch('/:songID', auth, songController.update);
router.delete('/:songID', auth, songController.delete);
router.get("/", cache.cacheAllSongs, songController.index);

module.exports = router;
