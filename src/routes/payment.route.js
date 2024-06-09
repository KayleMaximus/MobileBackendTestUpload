const express = require('express');
const router = express.Router();

const stripe = require("stripe")('sk_test_51POBbu1FjeTWqyK8tPSjnuuWP2l00e3YmmU8mmLU32R8vAxaJg1Vj8MiOBnT7qMrBZYkdvvttbJr3rjwkTR6BtgP00yWNiJk1u');
router.post("/", async (req, res) => {
  const { amountFromCLient } = req.body;
  //Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountFromCLient,
    currency: "aud",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;