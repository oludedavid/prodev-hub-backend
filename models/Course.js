const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  text: String,
  avatarUrl: String,
  reviewerName: String,
});

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    imageUrl: String,
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    numberOfHours: Number,
    numberOfLessons: Number,
    numberOfStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    courseLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert", "All Levels"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    curriculums: [String],
    price: {
      type: Number,
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    startDate: Date,
    endDate: Date,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tutor: String,
    language: String,
    overview: String,
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
