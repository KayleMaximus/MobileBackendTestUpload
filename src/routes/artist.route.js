const express = require('express');
const router = express.Router();
const multer = require('multer');

const artistController = require('../app/controllers/ArtistController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nameSong', artistController.getArtistBySongName);
router.get('/nameAlbum', artistController.getArtistByAlbumName);
router.get("/artistID", artistController.getArtistByAritstID);
router.get("/listSong", artistController.getListSongByAritstID);
router.get("/listAlbum", artistController.getListAlbumByAritstID);
router.post('/', upload.single('imageURL'), artistController.create);
router.patch('/:artistID',  artistController.update);
router.delete('/:artistID',  artistController.delete);
router.get('/', artistController.index);

module.exports = router;
