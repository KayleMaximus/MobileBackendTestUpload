const express = require('express');
const router = express.Router();
const auth = require('../app/middlewares/auth')

const genreController = require('../app/controllers/GenreController');

router.get('/', auth, genreController.index);
router.post('/', genreController.create);

module.exports = router;
