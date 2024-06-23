const stripe = require("stripe")('sk_test_51POBbu1FjeTWqyK8tPSjnuuWP2l00e3YmmU8mmLU32R8vAxaJg1Vj8MiOBnT7qMrBZYkdvvttbJr3rjwkTR6BtgP00yWNiJk1u');

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};