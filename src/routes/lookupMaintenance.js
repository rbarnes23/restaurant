const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all lookup items
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, group_id, group_name, display
      FROM restaurant.lookup
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching lookup items:', err.message, err.stack);
    res.status(500).json({ 
      error: 'Failed to fetch lookup items',
      details: err.message
    });
  }
});

// Create new lookup item
router.post('/', async (req, res) => {
  const { group_id, group_name, display } = req.body;

  // Explicitly ignore 'id' from the request body
  if (req.body.id) {
    console.warn('Ignoring provided id in request body:', req.body.id);
  }

  try {
    // Validate required fields
    if (!group_id || !group_name || !display) {
      return res.status(400).json({ error: 'Group ID, group name, and display are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.lookup (group_id, group_name, display)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [group_id, group_name, display]);

    res.status(201).json({
      id: rows[0].id,
      group_id,
      group_name,
      display
    });
  } catch (err) {
    console.error('Error creating lookup item:', err.message, err.stack);
    res.status(500).json({
      error: 'Failed to create lookup item',
      details: err.message
    });
  }
});

// Update lookup item
router.put('/:id', async (req, res) => {
  const { group_id, group_name, display } = req.body;
  try {
    if (!group_id || !group_name || !display) {
      return res.status(400).json({ error: 'Group ID, group name, and display are required' });
    }

    const { rowCount } = await pool.query(`
      UPDATE restaurant.lookup
      SET group_id = $1, group_name = $2, display = $3
      WHERE id = $4
    `, [group_id, group_name, display, req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Lookup item not found' });
    }

    res.json({ message: 'Lookup item updated successfully' });
  } catch (err) {
    console.error('Error updating lookup item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update lookup item', details: err.message });
  }
});

// Delete lookup item
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.lookup
      WHERE id = $1
    `, [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Lookup item not found' });
    }

    res.json({ message: 'Lookup item deleted successfully' });
  } catch (err) {
    console.error('Error deleting lookup item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete lookup item', details: err.message });
  }
});

module.exports = router;
