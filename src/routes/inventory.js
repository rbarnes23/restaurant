const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get transaction types for dropdown
router.get('/transaction-types', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, display
      FROM restaurant.lookup
      WHERE group_id = 7
      ORDER BY display
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transaction types:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch transaction types', details: err.message });
  }
});

// Create new inventory transaction
router.post('/', async (req, res) => {
  const { ingredient_id, transaction_type_id, quantity, unit, notes } = req.body;
  if (!ingredient_id || !transaction_type_id || !quantity || !unit) {
    return res.status(400).json({ error: 'ingredient_id, transaction_type_id, quantity, and unit are required' });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO restaurant.ingredient_inventory (ingredient_id, transaction_type_id, quantity, unit, notes)
      VALUES ($1, $2, $3, $4, $4, $5)
      RETURNING id
    `, [ingredient_id, transaction_type_id, quantity, unit, notes || null]);
    res.status(201).json({ inventory_id: rows[0].id });
  } catch (err) {
    console.error('Error creating inventory transaction:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create inventory transaction', details: err.message });
  }
});

module.exports = router;
