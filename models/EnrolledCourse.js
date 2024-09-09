const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const enrolledCourseSchema = new mongoose.Schema(
  {
    course: {
      type: ObjectId,
      ref: "CourseOffered",
      required: true,
    },
    owners: [
      {
        ownerId: {
          type: ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnrolledCourse", enrolledCourseSchema);
