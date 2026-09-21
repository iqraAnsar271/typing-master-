const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 24,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    mode: {
      type: String,
      enum: ["practice", "competition"],
      default: "practice",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);