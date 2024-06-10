const express = require('express');
const router = express.Router();

const paymentController = require('../app/controllers/PaymentController');

router.post("/upgradePremium" , paymentController.upgradePremium);
router.post("/" , paymentController.accuracy);

module.exports = router;