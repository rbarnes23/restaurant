const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        mi.menu_item_id, 
        mi.name, 
        mi.price::numeric(10,2) AS price,
        mi.image, 
        mi.category_id, 
        l.display AS category
      FROM restaurant.menu_items mi
      JOIN restaurant.lookup l ON mi.category_id = l.id
      ORDER BY mi.name
    `);
    
    // Ensure all prices are Numbers
    const items = rows.map(item => ({
      ...item,
      price: Number(item.price)
    }));
    
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu items:', err.message, err.stack);
    res.status(500).json({ 
      error: 'Failed to fetch menu items',
      details: err.message
    });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, display 
      FROM restaurant.lookup 
      WHERE group_name = 'Menu_Category'
      ORDER BY display
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// Create new menu item
router.post('/', async (req, res) => {
  const { name, price, category_id, image } = req.body;
  try {
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price and category are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.menu_items (name, price, category_id, image)
      VALUES ($1, $2, $3, $4)
      RETURNING menu_item_id
    `, [name, parseFloat(price), category_id, image || null]);

    res.status(201).json({
      menu_item_id: rows[0].menu_item_id,
      name,
      price: parseFloat(price),
      category_id,
      image
    });
  } catch (err) {
    console.error('Error creating menu item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create menu item', details: err.message });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  const { name, price, category_id, image } = req.body;
  try {
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price and category are required' });
    }

    const { rowCount } = await pool.query(`
      UPDATE restaurant.menu_items
      SET name = $1, price = $2, category_id = $3, image = $4
      WHERE menu_item_id = $5
    `, [name, parseFloat(price), category_id, image || null, req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully' });
  } catch (err) {
    console.error('Error updating menu item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update menu item', details: err.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.menu_items
      WHERE menu_item_id = $1
    `, [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete menu item', details: err.message });
  }
});

module.exports = router;
