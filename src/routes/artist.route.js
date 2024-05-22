const express = require('express');
const router = express.Router();
const multer = require('multer');

const artistController = require('../app/controllers/ArtistController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', artistController.index);
router.post('/', upload.single('imageURL'), artistController.create);

module.exports = router;