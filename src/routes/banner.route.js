const express = require('express');
const router = express.Router();
const multer = require('multer');

const bannerController = require('../app/controllers/BannerController');
const auth = require('../app/middlewares/auth')
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', bannerController.index);
router.get('/bannerID', bannerController.getBannerByBannerID);
router.post('/', upload.single('imageURL'), bannerController.create);
router.delete('/:bannerID', bannerController.delete);
router.patch('/:bannerID', bannerController.update);


module.exports = router;