const express = require("express");
const EnrolledCourse = require("../models/EnrolledCourse");
const Auth = require("../middleware/auth");
const router = new express.Router();

//get all enrolled courses
router.get("/enrolledCourses", Auth, async (req, res) => {
  try {
    // Check if the user has the role of 'admin'
    if (req.user.badge !== "admin") {
      return res.status(403).send({ message: "Access denied: Admins only" });
    }
    const enrolledCourses = await EnrolledCourse.find();
    res.send(enrolledCourses);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
