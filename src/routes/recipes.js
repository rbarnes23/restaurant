const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get recipes for a menu item
router.get('/', async (req, res) => {
  const { menu_item_id } = req.query;
  if (!menu_item_id) {
    return res.status(400).json({ error: 'menu_item_id is required' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT r.menu_item_id, r.ingredient_id, i.name AS ingredient_name, r.quantity::numeric, r.unit
      FROM restaurant.recipes r
      JOIN restaurant.ingredients i ON r.ingredient_id = i.ingredient_id
      WHERE r.menu_item_id = $1
    `, [menu_item_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recipes:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch recipes', details: err.message });
  }
});

// Get all ingredients for dropdown
router.get('/ingredients', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ingredient_id, name, unit
      FROM restaurant.ingredients
      ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ingredients:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err.message });
  }
});

// Add a recipe
router.post('/', async (req, res) => {
  const { menu_item_id, ingredient_id, quantity, unit } = req.body;
  if (!menu_item_id || !ingredient_id || !quantity || !unit) {
    return res.status(400).json({ error: 'menu_item_id, ingredient_id, quantity, and unit are required' });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO restaurant.recipes (menu_item_id, ingredient_id, quantity, unit)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (menu_item_id, ingredient_id) DO UPDATE
      SET quantity = EXCLUDED.quantity, unit = EXCLUDED.unit
      RETURNING menu_item_id, ingredient_id, quantity, unit
    `, [menu_item_id, ingredient_id, parseFloat(quantity), unit]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding recipe:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add recipe', details: err.message });
  }
});

// Edit a recipe
router.put('/:menu_item_id/:ingredient_id', async (req, res) => {
  const { menu_item_id, ingredient_id } = req.params;
  const { quantity, unit } = req.body;
  if (!quantity || !unit) {
    return res.status(400).json({ error: 'quantity and unit are required' });
  }
  try {
    const { rowCount } = await pool.query(`
      UPDATE restaurant.recipes
      SET quantity = $1, unit = $2
      WHERE menu_item_id = $3 AND ingredient_id = $4
    `, [parseFloat(quantity), unit, menu_item_id, ingredient_id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe updated successfully' });
  } catch (err) {
    console.error('Error updating recipe:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update recipe', details: err.message });
  }
});

// Delete a recipe
router.delete('/:menu_item_id/:ingredient_id', async (req, res) => {
  const { menu_item_id, ingredient_id } = req.params;
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.recipes
      WHERE menu_item_id = $1 AND ingredient_id = $2
    `, [menu_item_id, ingredient_id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Error deleting recipe:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete recipe', details: err.message });
  }
});

module.exports = router;
