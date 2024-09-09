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
  duration: {
    type: String,
    required: true,
  },
  tutor: {
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
