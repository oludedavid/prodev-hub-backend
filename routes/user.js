const User = require("../models/User");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Badge = require("../models/Badge");
const Auth = require("../middleware/auth");

// Create an instance of the badge class
const badgeManager = new Badge();

// Nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//signup
router.post("/users", async (req, res) => {
  const { fullName, email, password, badge } = req.body;
  try {
    // Check if the badge is valid
    if (!badgeManager.checkbadgeExists(badge)) {
      return res.status(400).json({ message: "Invalid badge specified" });
    }
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with that email already exists" });
    }

    // Create a new user
    const user = new User({ fullName, email, password, badge });

    //save password
    await user.save();

    // Generate and return a token for email verification
    const token = await user.generateAuthToken();

    // Create the verification URL
    const verificationUrl = `https://prodev-hub-frontend.vercel.app/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Verify Your Email Address",
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Welcome to Our Platform!</h2>
      <p>Hi ${user.fullName},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, you can also verify your email by clicking the following link:</p>
      <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>If you didn't sign up for this account, please ignore this email.</p>
      <p>Best regards,<br>Your Company Team</p>
    </div>
  `,
    };

    // Send the verification email
    await emailTransporter.sendMail(mailOptions);

    res.status(201).send({
      message:
        "Registration was successful. Please check your email to verify your account",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(400)
      .send({ message: "Something went wrong with registration", error });
  }
});

//verify email route based on the verification url generated fro the client side
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.EMAIL_JWT_SECRET || "RANDOM-TOKEN"
    );

    // Find the user by email
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Update the user's isVerified field
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).json({ message: "Invalid or expired token." });
  }
};

//login
router.post("/users/login", async (req, res) => {
  try {
    // Find the user in the database
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user) {
      return res.status(404).send({ message: "Email not found" });
    }

    // Check if the email is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }
    const token = await user.generateAuthToken();

    res.status(200).send({ user, token, message: "Login Successful" });
  } catch (error) {
    res.status(400).send(error);
  }
});

//logout
router.post("/users/logout", Auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).send();
  }
});

//logout all sessions
router.post("/users/logoutAll", Auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});
module.exports = router;
