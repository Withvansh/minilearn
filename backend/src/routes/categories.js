const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db('categories').select('*');
    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

module.exports = router;
