const express = require("express");
const router = express.Router();

const peerController = require('../app/controllers/PeerController');


router.get('/', peerController.index);


module.exports = router;