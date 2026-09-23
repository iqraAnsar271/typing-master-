const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/** Generate a signed JWT for the given user id */
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// ────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username, email and password." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // Check for duplicate username or email
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.trim() },
      ],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "username";
      return res
        .status(400)
        .json({ message: `A user with that ${field} already exists.` });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      joinDate: user.joinDate,
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed.", error: error.message });
  }
});

// ────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account has been disabled. Contact an admin." });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      joinDate: user.joinDate,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

// ────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Also pull aggregate score stats for this user
    const Score = require("../models/Score");
    const scores = await Score.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalTests = scores.length;
    let bestWpm = 0;
    let avgWpm = 0;
    let avgAcc = 0;

    if (totalTests > 0) {
      bestWpm = Math.max(...scores.map((s) => s.wpm));
      avgWpm = Math.round(
        scores.reduce((sum, s) => sum + s.wpm, 0) / totalTests
      );
      avgAcc = Math.round(
        scores.reduce((sum, s) => sum + s.accuracy, 0) / totalTests
      );
    }

    res.json({
      ...user.toObject(),
      stats: { totalTests, bestWpm, avgWpm, avgAcc },
      recentScores: scores.slice(0, 20),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile.", error: error.message });
  }
});

// ────────────────────────────────────────────
// PUT /api/auth/profile  (protected)
// ────────────────────────────────────────────
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (req.body.username) user.username = req.body.username.trim();
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters." });
      }
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      joinDate: user.joinDate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Profile update failed.", error: error.message });
  }
});

module.exports = router;
