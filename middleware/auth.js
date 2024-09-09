const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Check if Authorization header is missing
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).send({ error: "Token is missing from request" });
    }

    // Remove 'Bearer ' from the token
    const cleanToken = token.replace("Bearer ", "");

    // Verify JWT token with the secret
    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET || "RANDOM-TOKEN"
    );

    // Find the user with the provided token
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": cleanToken,
    });

    // If no user is found with the token
    if (!user) {
      return res.status(401).send({ error: "Invalid token, user not found" });
    }

    req.token = cleanToken;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ error: "Authentication required" });
  }
};

module.exports = auth;
