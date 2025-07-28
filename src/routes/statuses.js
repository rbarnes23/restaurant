const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all statuses
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, display
      FROM restaurant.lookup
      WHERE group_name = 'Order Status'
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching statuses:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch statuses', details: err.message });
  }
});

module.exports = router;
