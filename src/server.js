const express = require("express");
const router = express.Router();
const userRouter = require("../routers/user");
const courseOfferedRouter = require("../routers/courseOffered");
const orderRouter = require("../routers/order");
const enrolledCourseRouter = require("../routers/enrolledCourse");
const cartRouter = require("../routers/cart");
const cors = require("cors");

require("../db/mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(courseOfferedRouter);
app.use(enrolledCourseRouter);
app.use(cartRouter);
app.use(orderRouter);

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Proddev Hub API!" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(
    "Proddev Nexus Backend Server as taking flight " + process.env.PORT
  );
});
