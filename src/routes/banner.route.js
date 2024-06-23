const express = require('express');
const router = express.Router();
const multer = require('multer');

const bannerController = require('../app/controllers/BannerController');
const cache = require('../app/middlewares/cache');
const auth = require('../app/middlewares/auth')
const upload = multer({ storage: multer.memoryStorage() });

router.get('/bannerID', bannerController.getBannerByBannerID);
router.post('/', auth, upload.single('imageURL'), bannerController.create);
router.patch('/:bannerID', auth, bannerController.update);
router.delete('/:bannerID', auth, bannerController.delete);
router.get('/', cache.cacheAllBanners, bannerController.index);


module.exports = router;