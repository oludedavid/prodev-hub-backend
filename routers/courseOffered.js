const express = require("express");
const CourseOffered = require("../models/CourseOffered");
const coursesOfferedData = require("../config/coursesOffered.json");
const Auth = require("../middleware/auth");
const router = new express.Router();

//adding courses offered to the database
router.post("/courses/seeds", async (req, res, next) => {
  const courses = coursesOfferedData.coursesOffered; // Single course data
  try {
    // Clear the CourseOffered collection before seeding
    await CourseOffered.deleteMany({});

    // Insert a single course using insertOne
    await CourseOffered.insertMany(courses); // Use create or insertOne

    res.send("Course seeded successfully");
  } catch (err) {
    console.error("Error seeding course:", err);
    next(err);
  }
});

//creating an offered course mainly in admin dashboard
router.post("/courses/seeds", async (req, res, next) => {
  const courses = coursesOfferedData.coursesOffered;
  try {
    // Clear the CourseOffered collection before seeding
    await CourseOffered.deleteMany({});

    // Use insertMany to seed courses in a single batch operation
    await CourseOffered.insertOne(courses[0]);

    res.send("Courses seeded successfully");
  } catch (err) {
    console.error("Error seeding courses:", err);
    next(err);
  }
});

//updating a course that is offered
router.patch("/courses/:id", Auth, async (req, res) => {
  // Check if the user has the role of 'admin'
  if (req.user.badge !== "admin") {
    return res.status(403).send({ message: "Access denied: Admins only" });
  }
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description", "category", "price"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }
  try {
    const course = await CourseOffered.findOne({ _id: req.params.id });
    if (!course) {
      return res.status(404).send();
    }
    updates.forEach((update) => (course[update] = req.body[update]));
    await course.save();
    res.send(item);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/courses/:id", Auth, async (req, res) => {
  try {
    // Check if the user has the role of 'admin'
    if (req.user.badge !== "admin") {
      return res.status(403).send({ message: "Access denied: Admins only" });
    }

    const deletedItem = await Item.findOneAndDelete({ _id: req.params.id });
    if (!deletedItem) {
      res.status(404).send({ error: "Item not found" });
    }
    res.send(deletedItem);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get all courses
router.get("/courses", async (req, res) => {
  try {
    const items = await CourseOffered.find({});
    res.status(200).send(items);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
