const express = require('express');
const router = express.Router();
const auth = require('../app/middlewares/auth')

const genreController = require('../app/controllers/GenreController');

router.get('/genreName', genreController.getGenreBySongID);
router.get("/genreID", genreController.getGenreByGenreID);
router.get('/', genreController.index);
router.post('/', auth, genreController.create);
router.delete('/:genreID', genreController.delete);
router.patch('/:genreID', genreController.update);

module.exports = router;
