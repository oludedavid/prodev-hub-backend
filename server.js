require("dotenv").config();
require("./db/db-connector");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Proddev Hub API!" });
});

//Mount api routes
app.use("/api", require("./routes/api"));

// Use the router for handling routes
app.use(router);

app.listen(process.env.PORT || 5000, () => {
  console.log("Proddev Nexus Backend Server as taking flight ");
});
