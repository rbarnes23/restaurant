const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ingredient_id, name, unit, cost_per_unit::numeric AS cost_per_unit, description
      FROM restaurant.ingredients
      ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ingredients:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch ingredients', details: err.message });
  }
});

// Add new ingredient
router.post('/', async (req, res) => {
  const { name, unit, cost_per_unit, description } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: 'Name and unit are required' });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO restaurant.ingredients (name, unit, cost_per_unit, description)
      VALUES ($1, $2, $3, $4)
      RETURNING ingredient_id
    `, [name, unit, cost_per_unit ? parseFloat(cost_per_unit) : null, description || null]);
    res.status(201).json({ ingredient_id: rows[0].ingredient_id });
  } catch (err) {
    console.error('Error adding ingredient:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add ingredient', details: err.message });
  }
});

// Update ingredient
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, unit, cost_per_unit, description } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: 'Name and unit are required' });
  }
  try {
    const { rowCount } = await pool.query(`
      UPDATE restaurant.ingredients
      SET name = $1, unit = $2, cost_per_unit = $3, description = $4
      WHERE ingredient_id = $5
    `, [name, unit, cost_per_unit ? parseFloat(cost_per_unit) : null, description || null, id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient updated successfully' });
  } catch (err) {
    console.error('Error updating ingredient:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update ingredient', details: err.message });
  }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.ingredients
      WHERE ingredient_id = $1
    `, [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    console.error('Error deleting ingredient:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete ingredient', details: err.message });
  }
});

module.exports = router;
