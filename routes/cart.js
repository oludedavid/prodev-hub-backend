const express = require("express");
const Cart = require("../models/Cart");
const CourseOffered = require("../models/CourseOffered");
const Auth = require("../middleware/auth");
const router = new express.Router();

//Get cart
router.get("/cart", Auth, async (req, res) => {
  const owner = req.user._id;
  try {
    const cart = await Cart.findOne({ owner });
    if (cart && cart.courses.length > 0) {
      res.status(200).send(cart);
    } else {
      res.send(null);
    }
  } catch (error) {
    res.status(500).send();
  }
});

//Creare Cart
router.post("/cart", Auth, async (req, res, next) => {
  const owner = req.user._id;
  const { courseOfferedId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ owner });
    const course = await CourseOffered.findOne({ _id: courseOfferedId });
    //if course does not exist
    if (!course) {
      res.status(404).send({ message: "course not found" });
      return;
    }
    const price = course.price;
    const name = course.name;

    //if cart already exists
    if (cart) {
      const courseIndex = cart.courses.findIndex(
        (course) => course.courseOfferedId == courseOfferedId
      );
      //check if the course exist or not
      if (courseIndex) {
        let course = cart.courses[courseIndex];
        course.quantity = course.quantity + quantity;
        cart.bill = cart.courses.reduce((acc, course) => {
          return acc + course.price * course.quantity;
        }, 0);
        cart.courses[courseIndex] = course;
        await cart.save();
        res.status(200).send(cart);
      } else {
        cart.courses.push({ courseOfferedId, name, quantity, price });
        cart.bill = cart.courses.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);
        await cart.save();
        res.status(200).send(cart);
      }
    } else {
      const newCart = await Cart.create({
        owner,
        courses: [{ courseOfferedId, name, quantity, price }],
        bill: quantity * price,
      });
      return res.status(201).send(newCart);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong" + error);
  }
});
// Update a cart item (e.g., update quantity)
router.patch("/cart", Auth, async (req, res) => {
  const owner = req.user._id;
  const { courseOfferedId, quantity } = req.body;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ owner });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    // Find the course in the cart
    const courseIndex = cart.courses.findIndex(
      (course) => course.courseOfferedId == courseOfferedId
    );

    if (courseIndex === -1) {
      return res.status(404).send({ message: "Course not found in cart" });
    }

    // Update the course quantity
    let course = cart.courses[courseIndex];
    course.quantity = quantity; // Set the new quantity

    // Recalculate the cart bill
    cart.bill = cart.courses.reduce((acc, curr) => {
      return acc + curr.quantity * curr.price;
    }, 0);

    // Save the updated cart
    await cart.save();
    res.status(200).send(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong: " + error.message);
  }
});

router.delete("/cart/", Auth, async (req, res) => {
  const owner = req.user._id;
  const courseOfferedId = req.query.courseOfferedId;
  try {
    let cart = await Cart.findOne({ owner });
    const courseOfferedIndex = cart.courses.findIndex(
      (course) => course.courseOfferedId == courseOfferedId
    );
    if (courseOfferedIndex > -1) {
      let course = cart.courses[courseOfferedIndex];
      cart.bill -= course.quantity * course.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.courses.splice(courseOfferedIndex, 1);
      cart.bill = cart.courses.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      cart = await cart.save();
      res.status(200).send(cart);
    } else {
      res.status(404).send("course not found");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
});

module.exports = router;
