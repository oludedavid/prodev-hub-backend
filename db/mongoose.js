const mongoose = require("mongoose");
const { DB_CONNECTION_STRING, DB_USER, DB_PASSWORD } = process.env;

mongoose
  .connect(DB_CONNECTION_STRING, {
    auth: { username: DB_USER, password: DB_PASSWORD },
  })
  .then(() => {
    console.log("Connected to the database through the power of magic");
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });
