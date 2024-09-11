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
//function update cart bill
const updateCartBill = (cart) => {
  const totalBill = cart.courses.reduce((total, course) => {
    return total + course.price * course.quantity;
  }, 0);
  cart.bill = totalBill;
  return cart;
};
//Create Cart
router.post("/cart", Auth, async (req, res) => {
  try {
    const { courseOfferedId, quantity } = req.body;
    const userId = req.user._id;

    // Find the cart for the user
    let cart = await Cart.findOne({ owner: userId });

    if (!cart) {
      cart = new Cart({ owner: userId, courses: [] });
    }

    // Find the course being added
    const course = await CourseOffered.findById(courseOfferedId);

    // Check if the course is already in the cart
    const courseInCart = cart.courses.find(
      (c) => c.courseOfferedId.toString() === courseOfferedId
    );

    if (courseInCart) {
      // Update the quantity if the course is already in the cart
      courseInCart.quantity += quantity;
    } else {
      // Add the course to the cart if it's not already there
      cart.courses.push({
        courseOfferedId,
        name: course.name,
        quantity,
        price: course.price,
      });
    }

    // Update the total bill
    updateCartBill(cart);

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Course added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding course to cart", error });
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

router.delete("/cart", async (req, res) => {
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
