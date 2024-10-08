const express = require("express");
const Flutterwave = require("flutterwave-node-v3");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Auth = require("../middleware/auth");
const router = new express.Router();
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_V3_PUBLIC_KEY,
  process.env.FLUTTERWAVE_V3_SECRET_KEY
);

const flutterwaveSamplePayload = {
  card_number: "5531886652142950",
  cvv: "564",
  expiry_month: "09",
  expiry_year: "32",
  currency: "NGN",
  amount: "100",
  redirect_url: "https://www.google.com",
  fullname: "Bassit Owolabi",
  email: "barsee@gmail.con",
  phone_number: "0902620185",
  enckey: "",
  tx_ref: "MC-32444ee--4eerye4euee3rerds4423e43e",
};
//get all orders related to a user
router.get("/orders", Auth, async (req, res) => {
  const owner = req.user._id;
  try {
    const order = await Order.find({ owner: owner }).sort({ date: -1 });
    res.status(200).send(order);
  } catch (error) {
    res.status(500).send();
  }
});

//checkout
router.post("/order/checkout", Auth, async (req, res) => {
  try {
    const owner = req.user._id;
    let payload = req.body;

    //find cart and user
    let cart = await Cart.findOne({ owner });
    let user = req.user;
    if (cart) {
      payload = { ...payload, amount: cart.bill, email: user.email };
      const response = await flw.Charge.card(payload);
      // console.log(response)
      if (response.meta.authorization.mode === "pin") {
        let payload2 = payload;
        payload2.authorization = {
          mode: "pin",
          fields: ["pin"],
          pin: 3310,
        };
        const reCallCharge = await flw.Charge.card(payload2);

        const callValidate = await flw.Charge.validate({
          otp: "12345",
          flw_ref: reCallCharge.data.flw_ref,
        });
        console.log(callValidate);
        if (callValidate.status === "success") {
          const order = await Order.create({
            owner,
            courses: cart.courses,
            bill: cart.bill,
          });
          //delete cart
          const data = await Cart.findByIdAndDelete({ _id: cart.id });
          return res.status(201).send({ status: "Payment successful", order });
        } else {
          res.status(400).send("payment failed");
        }
      }
      if (response.meta.authorization.mode === "redirect") {
        let url = response.meta.authorization.redirect;
        open(url);
      }

      // console.log(response)
    } else {
      res.status(400).send("No cart found");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("invalid request");
  }
});

module.exports = router;
