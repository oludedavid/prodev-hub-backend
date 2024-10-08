const express = require("express");
const CourseOffered = require("../models/CourseOffered");
const coursesOfferedData = require("../config/coursesOffered.json");
const Auth = require("../middleware/auth");
const router = new express.Router();
const { v4: uuidv4 } = require("uuid");

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

//get all courses
router.get("/courses", async (req, res) => {
  try {
    const items = await CourseOffered.find({});
    res.status(200).send(items);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get course by id
router.patch("/courses/update-course/:id", Auth, async (req, res) => {
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

//delete course by id
router.delete("/courses/delete-course/:id", Auth, async (req, res) => {
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

//get course by id
router.get("/courses/course-by-id/:id", async (req, res) => {
  try {
    const item = await CourseOffered.findById(req.params.id);
    res.status(200).send(item);
  } catch (error) {
    res.status(400).send({
      message: "An error occurred while fetching the course by ID.",
      error: error,
    });
  }
});

//get course by name
router.get("/courses/course-by-name/:name", async (req, res) => {
  try {
    const items = await CourseOffered.find({
      name: { $regex: new RegExp(req.params.name, "i") },
    });

    if (items.length === 0) {
      return res
        .status(404)
        .send({ message: "No courses found with the specified name." });
    }

    res.status(200).send(items);
  } catch (error) {
    res
      .status(400)
      .send({ error: "An error occurred while fetching the courses." });
  }
});

//get all course category
router.get("/courses/course-categories", async (req, res) => {
  try {
    // Aggregate the data by category and count the number of courses in each category
    const categoriesWithCounts = await CourseOffered.aggregate([
      {
        $group: {
          _id: "$category",
          numberOfCourses: { $sum: 1 },
        },
      },
    ]);

    // Map the result and add a custom UUID as ID
    const response = categoriesWithCounts.map((category) => ({
      id: uuidv4(),
      name: category._id,
      numberOfCourses: category.numberOfCourses,
    }));

    res.status(200).send(response);
  } catch (error) {
    res.status(400).send({
      error: "An error occurred while fetching the categories with count.",
    });
  }
});
//get course by category
router.get(
  "/courses/course-categories/category/:category",
  async (req, res) => {
    try {
      const items = await CourseOffered.find({ category: req.params.category });

      if (items.length === 0) {
        return res
          .status(404)
          .send({ message: "No courses found in this category." });
      }

      res.status(200).send(items);
    } catch (error) {
      res
        .status(400)
        .send({ error: "An error occurred while fetching the courses." });
    }
  }
);

//get course by category and course name
router.get("/courses/:category/:name", async (req, res) => {
  try {
    const items = await CourseOffered.find({
      category: req.params.category,
      name: { $regex: new RegExp(req.params.name, "i") },
    });

    if (items.length === 0) {
      return res.status(404).send({
        message: "No courses found with the specified category and name.",
      });
    }

    res.status(200).send(items);
  } catch (error) {
    res
      .status(400)
      .send({ error: "An error occurred while fetching the courses." });
  }
});

module.exports = router;
