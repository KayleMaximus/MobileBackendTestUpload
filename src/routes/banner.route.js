const express = require('express');
const router = express.Router();
const multer = require('multer');

const bannerController = require('../app/controllers/BannerController');
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth')
const upload = multer({ storage: multer.memoryStorage() });

router.get('/bannerID', bannerController.getBannerByBannerID);
router.post('/', upload.single('imageURL'), bannerController.create);
router.delete('/:bannerID', bannerController.delete);
router.patch('/:bannerID', bannerController.update);
router.get('/', cache.cacheAllAlbums, bannerController.index);


module.exports = router;