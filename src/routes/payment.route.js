const express = require('express');
const router = express.Router();

const stripe = require("stripe")('sk_test_51POBbu1FjeTWqyK8tPSjnuuWP2l00e3YmmU8mmLU32R8vAxaJg1Vj8MiOBnT7qMrBZYkdvvttbJr3rjwkTR6BtgP00yWNiJk1u');
const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

router.post("/", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
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