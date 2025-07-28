const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all maintenance options
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, display 
      FROM restaurant.lookup 
      WHERE group_id = 3 AND group_name = 'Maintenance'
      ORDER BY display
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching maintenance options:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch maintenance options', details: err.message });
  }
});

module.exports = router;
