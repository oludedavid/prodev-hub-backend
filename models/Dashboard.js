const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const dashboardSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
