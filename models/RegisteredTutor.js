const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const RegisteredTutorSchema = new mongoose.Schema(
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
          ref: "Course",
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
          enum: ["In Progress", "Completed"],
          default: "In Progress",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
