const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get Leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const leaderboard = await db('users')
      .select('id', 'username', 'xp', 'streak')
      .orderBy('xp', 'desc')
      .limit(10);
    res.json({ leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching leaderboard.' });
  }
});

// Get User Learning Summary
router.get('/summary', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const totalLessons = await db('lessons').count('id as count').first();
    const completedLessons = await db('user_progress')
      .where('user_id', userId)
      .andWhere('completed', true)
      .count('id as count')
      .first();

    const user = await db('users').where('id', userId).first();

    res.json({
      xp: user.xp,
      streak: user.streak,
      totalLessons: totalLessons.count,
      completedLessons: completedLessons.count,
      lastActive: user.last_active_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching user summary.' });
  }
});

module.exports = router;
