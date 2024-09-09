const express = require("express");
const CourseOffered = require("../models/CourseOffered");
const coursesOfferedData = require("../config/coursesOffered.json");
const Auth = require("../middleware/auth");
const router = new express.Router();

//adding courses offered to the database
router.post("/seed", async (req, res, next) => {
  const courses = coursesOfferedData.coursesOffered;
  try {
    // Clear the users collection before seeding
    await User.deleteMany({});
    //Add new users
    for (let x = 0; x < courses.length; x++) {
      // Create a new user
      const courseOffered = new CourseOffered({
        ...courses[x],
      });

      // Save the user to the database
      await courseOffered.save();
    }
    res.send("Courses seeded successfully");
  } catch (err) {
    console.error("Error seeding courses:", err);
    next(err);
  }
});

//creating an offered course mainly in admin dashboard
router.post("/courseOffered", Auth, async (req, res) => {
  try {
    // Check if the user has the role of 'admin'
    if (req.user.badge !== "admin") {
      return res.status(403).send({ message: "Access denied: Admins only" });
    }
    const newCourseOffered = new CourseOffered({
      ...req.body,
      owner: req.user._id,
    });
    await newCourseOffered.save();
    res.status(201).send(newCourseOffered);
  } catch (error) {
    res.status(400).send({ message: "error" });
  }
});

//updating a course that is offered
router.patch("/coursesOffered/:id", Auth, async (req, res) => {
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

router.delete("/coursesOffered/:id", Auth, async (req, res) => {
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
router.get("/coursesOffered", async (req, res) => {
  try {
    const items = await CourseOffered.find({});
    res.status(200).send(items);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
