const express = require('express');
const router = express.Router();
const multer = require('multer');

const artistController = require('../app/controllers/ArtistController');
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nameSong', artistController.getArtistBySongName);
router.get('/nameAlbum', artistController.getArtistByAlbumName);
router.get("/artistID", artistController.getArtistByAritstID);
router.get("/listSong", artistController.getListSongByAritstID);
router.get("/listAlbum", artistController.getListAlbumByAritstID);
router.post('/', auth, upload.single('imageURL'), artistController.create);
router.patch('/:artistID', auth, artistController.update);
router.delete('/:artistID', auth, artistController.delete);
router.get('/', cache.cacheAllArtists, artistController.index);

module.exports = router;
