const express = require("express");
const User = require("../models/User");
const Score = require("../models/Score");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ────────────────────────────────────────────
// GET /api/admin/stats  — Dashboard overview
// ────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalScores = await Score.countDocuments();

    const avgPipeline = await Score.aggregate([
      { $group: { _id: null, avgWpm: { $avg: "$wpm" }, avgAcc: { $avg: "$accuracy" } } },
    ]);

    const avgWpm = avgPipeline.length > 0 ? Math.round(avgPipeline[0].avgWpm) : 0;
    const avgAcc = avgPipeline.length > 0 ? Math.round(avgPipeline[0].avgAcc) : 0;

    // New registrations in the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({
      totalUsers,
      activeUsers,
      totalScores,
      avgWpm,
      avgAcc,
      newUsersThisWeek,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats.", error: error.message });
  }
});

// ────────────────────────────────────────────
// GET /api/admin/users  — All users list
// ────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Attach score counts per user
    const userIds = users.map((u) => u._id);
    const scoreCounts = await Score.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          totalTests: { $sum: 1 },
          bestWpm: { $max: "$wpm" },
          avgWpm: { $avg: "$wpm" },
          avgAcc: { $avg: "$accuracy" },
        },
      },
    ]);

    const statsMap = {};
    scoreCounts.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalTests: s.totalTests,
        bestWpm: s.bestWpm,
        avgWpm: Math.round(s.avgWpm),
        avgAcc: Math.round(s.avgAcc),
      };
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      stats: statsMap[u._id.toString()] || {
        totalTests: 0,
        bestWpm: 0,
        avgWpm: 0,
        avgAcc: 0,
      },
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users.", error: error.message });
  }
});

// ────────────────────────────────────────────
// GET /api/admin/users/:id/scores  — User score history
// ────────────────────────────────────────────
router.get("/users/:id/scores", async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: "Failed to load scores.", error: error.message });
  }
});

// ────────────────────────────────────────────
// PUT /api/admin/users/:id  — Update user
// ────────────────────────────────────────────
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent the last admin from being demoted
    if (user.role === "admin" && req.body.role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot demote the only remaining admin." });
      }
    }

    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user.", error: error.message });
  }
});

// ────────────────────────────────────────────
// DELETE /api/admin/users/:id  — Delete user
// ────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the only remaining admin." });
      }
    }

    // Delete user and their scores
    await Score.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: "User and associated scores deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user.", error: error.message });
  }
});

module.exports = router;
