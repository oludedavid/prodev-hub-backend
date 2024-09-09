const express = require("express");
const RegisteredTutor = require("../models/RegisteredTutor");
const Auth = require("../middleware/auth");
const router = new express.Router();

//get all registered tutors
router.get("/registeredTutors", Auth, async (req, res) => {
  try {
    // Check if the user has the role of 'admin'
    if (req.user.badge !== "admin") {
      return res.status(403).send({ message: "Access denied: Admins only" });
    }
    const registeredTutors = await RegisteredTutor.find();
    res.send(registeredTutors);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
