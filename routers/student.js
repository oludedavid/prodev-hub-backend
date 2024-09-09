const express = require("express");
const EnrolledStudent = require("../models/EnrolledStudent");
const Auth = require("../middleware/auth");
const router = new express.Router();

//get all enrolled students
router.get("/enrolledStudents", Auth, async (req, res) => {
  try {
    // Check if the user has the role of 'admin'
    if (req.user.badge !== "admin") {
      return res.status(403).send({ message: "Access denied: Admins only" });
    }
    const enrolledStudents = await EnrolledStudent.find();
    res.send(enrolledStudents);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
