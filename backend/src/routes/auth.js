const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_minilearn_2026';

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide username, email, and password.' });
  }

  try {
    const existingUser = await db('users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [userId] = await db('users').insert({
      username,
      email,
      password_hash,
      xp: 0,
      streak: 0,
      last_active_at: null
    }).returning('id');

    const actualId = typeof userId === 'object' ? (userId.id || userId) : userId;
    const token = jwt.sign({ userId: actualId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: actualId,
        username,
        email,
        xp: 0,
        streak: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const user = await db('users').where('email', email).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Handle Streak Updates
    let updatedStreak = user.streak;
    const now = new Date();
    const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;

    if (lastActive) {
      const diffTime = Math.abs(now - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        updatedStreak += 1;
      } else if (diffDays > 1) {
        updatedStreak = 1;
      }
    } else {
      updatedStreak = 1;
    }

    await db('users')
      .where('id', user.id)
      .update({
        streak: updatedStreak,
        last_active_at: now
      });

    user.streak = updatedStreak;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current User Profile Route
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
