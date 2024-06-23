const express = require('express');
const router = express.Router();
const multer = require('multer');

const albumController = require('../app/controllers/AlbumController');
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nameSong', albumController.getAlbumtBySongName);
router.get('/nameArtist', albumController.getAlbumtByArtistName);
router.get('/albumID', albumController.getAlbumByAlbumID);
router.get('/nameAlbum', albumController.getAlbumByAlbumName);
router.get("/listSong", albumController.getListSongByAlbumID);
router.patch('/:albumID',  albumController.update);
router.delete('/:albumID',  albumController.delete);
router.post('/', upload.single('imageURL'), albumController.create);
router.get('/', cache.cacheAllAlbums, albumController.index);

module.exports = router;
