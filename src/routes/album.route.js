const express = require('express');
const router = express.Router();
const multer = require('multer');

const albumController = require('../app/controllers/AlbumController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/nameSong', albumController.getAlbumtBySongName);
router.get('/nameArtist', albumController.getAlbumtByArtistName);
router.get('/', albumController.index);
router.post('/', upload.single('imageURL'), albumController.create);

module.exports = router;
