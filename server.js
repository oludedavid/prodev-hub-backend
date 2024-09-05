require("dotenv").config();
require("./db/db-connector");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Mount api routes
app.use("/api", require("./routes/api"));

// Use the router for handling routes
app.use(router);

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    "Proddev Nexus Backend Server running on " + process.env.SERVER_PORT
  );
});
