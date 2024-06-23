const express = require('express');
const router = express.Router();
const auth = require('../app/middlewares/auth')
const multer = require("multer");

const genreController = require('../app/controllers/GenreController');
const cache = require('../app/middlewares/cache');
const upload = multer();

router.get('/genreName', genreController.getGenreBySongID);
router.get("/genreID", genreController.getGenreByGenreID);
router.post('/', auth, upload.single("imageURL"), genreController.create);
router.delete('/:genreID', auth, genreController.delete);
router.patch('/:genreID', auth, genreController.update);
router.get('/', cache.cacheAllGenres, genreController.index);

module.exports = router;
