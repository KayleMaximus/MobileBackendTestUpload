const express = require('express');
const router = express.Router();
const multer = require('multer');

const songController = require('../app/controllers/SongController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', songController.index);
router.post('/', upload.single('songFile'), songController.create);

module.exports = router;
