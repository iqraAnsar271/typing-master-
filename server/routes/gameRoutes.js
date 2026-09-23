const express = require("express");
const jwt = require("jsonwebtoken");
const Score = require("../models/Score");

const router = express.Router();

router.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find().sort({ wpm: -1, accuracy: -1, createdAt: 1 }).limit(100);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: "Unable to load scores." });
  }
});

router.post("/scores", async (req, res) => {
  try {
    // Optionally extract userId from JWT if the user is logged in
    let userId = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Token invalid — still allow anonymous score submission
      }
    }

    const score = await Score.create({
      userId,
      username: String(req.body.username || "Player 1").trim().slice(0, 24),
      wpm: Number(req.body.wpm),
      accuracy: Number(req.body.accuracy),
      mode: req.body.mode || "practice",
      date: req.body.date || null,
    });

    res.status(201).json(score);
  } catch (error) {
    res.status(400).json({ message: "Invalid score.", error: error.message });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const filter = {};
    if (req.query.mode) filter.mode = req.query.mode;
    if (req.query.date) filter.date = req.query.date;

    const scores = await Score.find(filter)
      .sort({ wpm: -1, accuracy: -1, createdAt: 1 })
      .limit(100)
      .lean();

    res.json(
      scores.map((score) => ({
        ...score,
        name: score.username,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Unable to load leaderboard." });
  }
});

module.exports = router;