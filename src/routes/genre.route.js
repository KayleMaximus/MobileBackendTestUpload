const express = require('express');
const router = express.Router();
const auth = require('../app/middlewares/auth')
const multer = require("multer");

const genreController = require('../app/controllers/GenreController');
const upload = multer();


router.get('/genreName', genreController.getGenreBySongID);
router.get("/genreID", genreController.getGenreByGenreID);
router.get('/', genreController.index);
router.post('/', auth, upload.single("imageURL"), genreController.create);
router.delete('/:genreID', auth, genreController.delete);
router.patch('/:genreID', auth, genreController.update);

module.exports = router;
