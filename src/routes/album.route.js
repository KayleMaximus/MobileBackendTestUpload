const express = require('express');
const router = express.Router();
const multer = require('multer');

const albumController = require('../app/controllers/AlbumController');
const auth = require('../app/middlewares/auth');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nameSong', albumController.getAlbumtBySongName);
router.get('/nameArtist', albumController.getAlbumtByArtistName);
router.get('/albumID', albumController.getAlbumByAlbumID);
router.get('/nameAlbum', albumController.getAlbumByAlbumName);
router.get('/', auth, albumController.index);
router.post('/', upload.single('imageURL'), albumController.create);

module.exports = router;
