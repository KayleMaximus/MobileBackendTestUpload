const express = require('express');
const router = express.Router();

const genreController = require('../app/controllers/GenreController');

router.get('/', genreController.index);
router.post('/', genreController.create);

module.exports = router;
