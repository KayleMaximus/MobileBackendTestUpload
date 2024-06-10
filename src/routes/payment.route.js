const express = require("express");
const router = express.Router();

const paymentController = require("../app/controllers/PaymentController");
const handlePayment = require("../app/middlewares/payment");

router.post("/upgradePremium", handlePayment, paymentController.upgradePremium);
router.post("/downgradePremium", paymentController.downgradePremium);
router.post("/", paymentController.accuracy);

module.exports = router;
