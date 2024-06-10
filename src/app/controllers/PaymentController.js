const { db } = require("../../config/db/firebase");
const User = require("../models/User");

const stripe = require("stripe")(
  "sk_test_51POBbu1FjeTWqyK8tPSjnuuWP2l00e3YmmU8mmLU32R8vAxaJg1Vj8MiOBnT7qMrBZYkdvvttbJr3rjwkTR6BtgP00yWNiJk1u"
);

class PaymentController {
  async accuracy(req, res) {
    const { amountFromCLient } = req.body;
    //Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 23,
      currency: "usd",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }

  async upgradePremium(req, res) {
    const { userID, balance } = req.body;
    const expiredDate = req.expiredDate;
    const role = req.role;

    const updatedData = {};
    if (expiredDate) updatedData.expiredDatePremium = expiredDate;
    if (role) updatedData.role = role;

    try {
      try {
        // Tìm tài liệu có trường id phù hợp
        const userRef = db.collection("users").where("userID", "==", userID);
        const myUser = await userRef.get();

        if (myUser.empty) {
          res.status(404).send("User not found");
          return;
        }

        // Cập nhật chỉ các trường đã được cung cấp trong updatedData
        const doc = myUser.docs[0];
        await doc.ref.update(updatedData);
      } catch (error) {
        console.error("Error updating user: ", error);
        res.status(500).send("Internal Server Error");
      }

      try {
        // Tìm tài liệu có trường id phù hợp
        const adminRef = db
          .collection("users")
          .where("userID", "==", "THK88")
          .limit(1);
        let adminTreasury;
        await adminRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            const userData = doc.data();
            adminTreasury = userData.treasury;
          });
        });

        console.log(adminTreasury);

        const myAdmin = await adminRef.get();

        if (myAdmin.empty) {
          res.status(404).send("User not found");
          return;
        }

        const updateTreasury = {};
        if (balance) updateTreasury.treasury = adminTreasury + balance;

        // Cập nhật chỉ các trường đã được cung cấp trong updatedData
        const doc = myAdmin.docs[0];
        await doc.ref.update(updateTreasury);
      } catch (error) {
        console.error("Error updating user: ", error);
        res.status(500).send("Internal Server Error");
      }
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }

    res.status(200).send("Update Premium successfully!");
  }

  async downgradePremium(req, res) {
    console.log("toidayroiiiiiiiiiiiiiiii");
    const userID = req.query.userID;
    try {
      // Tìm tài liệu có trường id phù hợp
      const userRef = db.collection("users").where("userID", "==", userID);
      const myUser = await userRef.get();

      const updatedData = {};
      updatedData.expiredDatePremium = "None";
      updatedData.role = "Normal";

      if (myUser.empty) {
        res.status(404).send("User not found");
        return;
      }

      // Cập nhật chỉ các trường đã được cung cấp trong updatedData
      const doc = myUser.docs[0];
      await doc.ref.update(updatedData);
    } catch (error) {
      console.error("Error updating user: ", error);
      res.status(500).send("Internal Server Error");
    }

    res.status(200).send("Update Normal successfully!");
  }
}

module.exports = new PaymentController();
