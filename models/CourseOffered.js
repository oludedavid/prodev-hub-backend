const mongoose = require("mongoose");

const courseOfferedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
    default: "../assets/images/courseImage.png",
  },
  duration: {
    type: String,
    required: true,
  },
  tutorName: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
  maxNumberOfStudents: {
    type: Number,
    required: true,
  },
  numberOfEnrolledStudents: {
    type: Number,
    default: 0,
  },
});

const CourseOffered = mongoose.model("CourseOffered", courseOfferedSchema);
module.exports = CourseOffered;
