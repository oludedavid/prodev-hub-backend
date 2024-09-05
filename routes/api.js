const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/rbcaMiddleware");
const auth = require("../controllers/auth");

// Home Route
router.get("/", (req, res) => {
  res.sendFile("./index.html", { root: __dirname });
});

// Get all users based on the role
router.get("/allUsers", roleMiddleware.filterUsersByRole());

//search endpoint for the admin users to search for users by name or email or role
// Search Endpoint for Admins
router.get("/search", roleMiddleware.searchUser);

//pagination endpoint using the page and the pageSize as query parameters
router.get("/pagination", async (req, res) => {
  try {
    //get the page number(page) and the desired number of items per page(pageSize)
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);

    // Get the total number of users (for calculating total pages)
    const totalUsers = await User.countDocuments({});

    //find the starting index per page,
    const startingIndex = (page - 1) * pageSize;

    // //find the ending index per page
    // const endingIndex = page * pageSize;

    //slice the users based on the starting and ending index
    // const paginatedUsers = totalUsers.slice(startingIndex, endingIndex);

    // Retrieve the paginated users directly from the database
    const paginatedUsers = await User.find({})
      .skip(startingIndex) // Skip the users from previous pages
      .limit(pageSize); // Limit to the page size

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Send the paginated users and total pages as the API response
    res.json({ users: paginatedUsers, totalPages, currentPage: page });
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

// Student Dashboard Route
router.get(
  "/dashboard/student",
  roleMiddleware.studentDashboard, // Use the generic role check middleware
  (req, res) => {
    res.json({ message: "You are Authorised to access this endpoint" });
  }
);

// Tutor Dashboard Route
router.get(
  "/dashboard/tutor",
  roleMiddleware.tutorDashboard, // Use the generic role check middleware
  (req, res) => {
    res.json({ message: "You are Authorised to access this endpoint" });
  }
);

// Admin Dashboard Route
router.get(
  "/dashboard/admin",
  roleMiddleware.adminDashboard, // Use the generic role check middleware
  (req, res) => {
    res.json({ message: "You are Authorised to access this endpoint" });
  }
);

// Register Route
router.post("/register", auth.register);

// Login Route
router.post("/login", auth.login);

//update user
// Update Profile Route
router.put("/profile", auth.updateProfile);

module.exports = router;
