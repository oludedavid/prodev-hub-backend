const jwt = require("jsonwebtoken");
const Permissions = require("../models/Permissions");
const User = require("../models/User");
// Middleware factory to check if the user has a specific badge
const checkbadge = (requiredBadge) => {
  return (req, res, next) => {
    try {
      // Check if the Authorization header is present
      if (!req.headers.authorization) {
        return res.status(401).json({
          message: "Authorization header missing. User is not logged in.",
        });
      }

      // Get the token from the Authorization header
      const token = req.headers.authorization.split(" ")[1];

      // Verify the token using the JWT secret
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || "RANDOM-TOKEN"
      );

      // Check if the user has the required badge
      if (decodedToken.badge !== requiredBadge) {
        return res.status(403).json({
          message: `Access denied: ${requiredBadge}s only. Your badge: ${decodedToken.badge}`,
        });
      }

      // Pass the user object to the request object for further use
      req.user = decodedToken;
      next(); // Proceed to the next middleware or endpoint
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};

exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const userBadge = req.user ? req.user.badge : "anonymous";
    const userPermissions = new Permissions().getPermissionsBybadgeName(
      userbadge
    );

    // Check if the user has the required permission
    if (userPermissions && userPermissions.includes(permission)) {
      req.userPermissions = userPermissions; // Attach permissions to the request object
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ error: "Access denied" });
    }
  };
};

//Accessing/filter all users data based on the badge
exports.filterUsersBybadge = () => {
  return async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({
          message: "Authorization header missing. User is not logged in.",
        });
      }

      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || "RANDOM-TOKEN"
      );

      const userData = await User.findById(decodedToken.id);

      if (!userData) {
        return res.status(404).json({ message: "User data not found" });
      }

      if (decodedToken.badge === "admin") {
        const allUsers = await User.find({});
        return res.json({
          students: allUsers.filter((user) => user.badge === "student"),
          tutors: allUsers.filter((user) => user.badge === "tutor"),
          admins: allUsers.filter((user) => user.badge === "admin"),
          permissions: new Permissions().getPermissionsBybadgeName("admin"),
        });
      } else if (decodedToken.badge === "tutor") {
        return res.json({
          userData: userData,
          permissions: new Permissions().getPermissionsBybadgeName("tutor"),
        });
        // TODO: In the future, allow tutors to see the list of students attending their courses.
      } else if (decodedToken.badge === "student") {
        return res.json({
          userData: userData,
          permissions: new Permissions().getPermissionsBybadgeName("student"),
        });
      }

      return res.status(403).json({ message: "Access denied" });
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};

//Adding a search functionality for the admin users to search for users by name or email or badge
exports.searchUser = async (req, res) => {
  try {
    // Check if the Authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "Authorization header missing. User is not logged in.",
      });
    }

    // Verify the token and check if the user is an admin
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "RANDOM-TOKEN"
    );

    if (decodedToken.badge !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    // Build the search query dynamically from query parameters
    const searchCriteria = {};

    // if (req.query.name) {
    //   searchCriteria.name = { $regex: req.query.name, $options: "i" };
    // }
    if (req.query.email) {
      searchCriteria.email = { $regex: req.query.email, $options: "i" };
    }

    if (Object.keys(searchCriteria).length === 0) {
      return res.status(400).json({
        message: "At least one search criterion (name or email) is required",
      });
    }

    // Perform the search
    const searchResults = await User.find(searchCriteria);

    // Return the search results
    return res.json({
      searchResults,
    });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Exporting specific badge-checking middleware
exports.studentDashboard = checkbadge("student");
exports.tutorDashboard = checkbadge("tutor");
exports.adminDashboard = checkbadge("admin");
