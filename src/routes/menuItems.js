const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all menu items (optionally filtered by category_id)
router.get('/', async (req, res, next) => {
  try {
    const { category_id } = req.query;
    let query = `
      SELECT mi.menu_item_id, mi.name, mi.price, mi.image, 
             l.display AS category, mi.category_id
      FROM restaurant.menu_items mi
      JOIN restaurant.lookup l ON mi.category_id = l.id
    `;
    let params = [];

    if (category_id) {
      query += ' WHERE mi.category_id = $1';
      params.push(category_id);
    }

    console.log('Executing query:', query, 'with params:', params); // Debug log
    const { rows } = await pool.query(query, params);
    console.log('Query result:', rows); // Debug log

    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu items:', err.message, err.stack);
    next(err);
  }
});

// Get a single menu item by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT mi.menu_item_id, mi.name, mi.price, mi.image, 
             l.display AS category, mi.category_id
      FROM restaurant.menu_items mi
      JOIN restaurant.lookup l ON mi.category_id = l.id
      WHERE mi.menu_item_id = $1
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching menu item:', err.message, err.stack);
    next(err);
  }
});

module.exports = router;
