const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const EnrolledStudentSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    courses: [
      {
        courseId: {
          type: ObjectId,
          ref: "EnrolledCourse",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["Enrolled", "Completed", "Not Enrolled"],
          default: "Not Enrolled",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
