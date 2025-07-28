const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all menu categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, display 
      FROM restaurant.lookup 
      WHERE group_name = 'Menu_Category'
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch menu categories' });
  }
});

module.exports = router;
