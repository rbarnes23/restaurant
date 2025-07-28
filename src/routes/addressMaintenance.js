const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all addresses
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT address_id, user_id, street, city, state, zip_code, country, is_default
      FROM restaurant.addresses
      ORDER BY address_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching addresses:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch addresses', details: err.message });
  }
});

// Create new address
router.post('/', async (req, res) => {
  const { user_id, street, city, state, zip_code, country, is_default } = req.body;
  try {
    // Validate required fields
    if (!street || !city || !state || !zip_code || !country) {
      return res.status(400).json({ error: 'Street, city, state, zip code, and country are required' });
    }

    // Validate zip_code format (basic example, adjust as needed)
    if (!/^\d{5}(-\d{4})?$/.test(zip_code)) {
      return res.status(400).json({ error: 'Invalid zip code format' });
    }

    // Validate user_id if provided
    if (user_id) {
      const { rowCount } = await pool.query(`
        SELECT 1 FROM restaurant.users WHERE user_id = $1
      `, [user_id]);
      if (rowCount === 0) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
    }

    // If is_default is true, update other addresses to set is_default = false
    if (is_default) {
      await pool.query(`
        UPDATE restaurant.addresses
        SET is_default = false
        WHERE is_default = true
      `);
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.addresses (user_id, street, city, state, zip_code, country, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING address_id
    `, [user_id || null, street, city, state, zip_code, country, is_default || false]);

    res.status(201).json({
      address_id: rows[0].address_id,
      user_id,
      street,
      city,
      state,
      zip_code,
      country,
      is_default: is_default || false
    });
  } catch (err) {
    console.error('Error creating address:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create address', details: err.message });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  const { user_id, street, city, state, zip_code, country, is_default } = req.body;
  try {
    // Validate required fields
    if (!street || !city || !state || !zip_code || !country) {
      return res.status(400).json({ error: 'Street, city, state, zip code, and country are required' });
    }

    // Validate zip_code format (basic example, adjust as needed)
    if (!/^\d{5}(-\d{4})?$/.test(zip_code)) {
      return res.status(400).json({ error: 'Invalid zip code format' });
    }

    // Validate user_id if provided
    if (user_id) {
      const { rowCount } = await pool.query(`
        SELECT 1 FROM restaurant.users WHERE user_id = $1
      `, [user_id]);
      if (rowCount === 0) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
    }

    // If is_default is true, update other addresses to set is_default = false
    if (is_default) {
      await pool.query(`
        UPDATE restaurant.addresses
        SET is_default = false
        WHERE is_default = true AND address_id != $1
      `, [req.params.id]);
    }

    const { rowCount } = await pool.query(`
      UPDATE restaurant.addresses
      SET user_id = $1, street = $2, city = $3, state = $4, zip_code = $5, country = $6, is_default = $7
      WHERE address_id = $8
    `, [user_id || null, street, city, state, zip_code, country, is_default || false, req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address updated successfully' });
  } catch (err) {
    console.error('Error updating address:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update address', details: err.message });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.addresses
      WHERE address_id = $1
    `, [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Error deleting address:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete address', details: err.message });
  }
});

module.exports = router;
