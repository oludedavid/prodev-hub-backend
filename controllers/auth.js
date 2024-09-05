const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Role = require("../models/role");
const Permissions = require("../models/permissions");

// Create an instance of the Role class
const roleManager = new Role();
//permission manager
const permissionManager = new Permissions();
//register a user to the database
exports.register = async (req, res) => {
  try {
    // Get the payload from the request body

    const { fullName, email, password, role } = req.body;

    // Check if the user role exists or is valid
    if (!roleManager.checkRoleExists(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ fullName, email, password: hashPassword, role });

    // Save the user
    await user.save();

    // Return a success message
    res.status(201).json({
      message: "User created successfully. Please log into your account! 😊",
    });
  } catch (err) {
    console.error("Error during registration:", err);

    res.status(500).json({ message: "Server error, please try again later" });
  }
};

//login a user
exports.login = async (req, res) => {
  try {
    // get the payload data
    const { email, password } = req.body;

    // find the user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "Email not found" });
    }

    // compare the password entered by the user with that of the found user that matches the email using bcrypt
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res.status(400).send({
        message: "Password does not match",
      });
    }

    // get user role from the found user
    const userRole = user.role;

    // get user permissions
    const userPermissions =
      permissionManager.getPermissionsByRoleName(userRole);

    // create session management using jwt
    let token = jwt.sign(
      {
        fullName: user.fullName,
        email: user.email,
        id: user._id,
        role: userRole,
      },
      process.env.JWT_SECRET || "RANDOM-TOKEN",
      { expiresIn: "24h", algorithm: "HS256" }
    );

    return res.status(200).send({
      message: "Login Successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        role: userRole,
        email: user.email,
        permissions: userPermissions,
      },
      token,
    });
  } catch (jwtError) {
    return res
      .status(500)
      .send({ message: "Internal server error during token creation." });
  }
};

//Allow users to update their profile
// Allow users to update their profile (currently focusing on password)
exports.updateProfile = async (req, res) => {
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

    // Get the user id
    const userId = decodedToken.id;

    // Get the user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if the old password is provided and matches
    if (req.body.password && req.body.newPassword) {
      const passwordCheck = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!passwordCheck) {
        return res.status(400).json({
          message: "Old password is incorrect",
        });
      }

      // Ensure the new password is not the same as the old one
      if (req.body.password === req.body.newPassword) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
      user.password = hashedPassword;
    }

    // Save the updated user details
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error during profile update:", err);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};
