const express = require('express');
const router = express.Router();
const multer = require('multer');

const songController = require('../app/controllers/SongController');
const upload = multer();

router.get('/getAllSongName', songController.getAllSongName);
router.post('/', upload.single('songFile'), songController.create);
router.get('/', songController.index);

module.exports = router;
