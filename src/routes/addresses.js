const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new address
router.post('/', async (req, res, next) => {
  try {
    const { user_id, street, city, state, zip_code, country, is_default } = req.body;

    // Validate required fields
    if (!street || !city || !state || !zip_code || !country) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    // Verify user exists if provided
    if (user_id) {
      const [user] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // If is_default is true, unset other default addresses for the user
    if (is_default && user_id) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [user_id]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, street, city, state, zip_code, country, is_default || false]
    );

    res.status(201).json({
      address_id: result.insertId,
      user_id,
      street,
      city,
      state,
      zip_code,
      country,
      is_default: is_default || false,
    });
  } catch (err) {
    console.error('Error creating address:', err.message, err.stack);
    next(err);
  }
});

// Get all addresses (optionally filtered by user_id)
router.get('/', async (req, res, next) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT address_id, user_id, street, city, state, zip_code, country, is_default FROM addresses';
    let params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching addresses:', err.message, err.stack);
    next(err);
  }
});

// Get a single address by ID
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT address_id, user_id, street, city, state, zip_code, country, is_default FROM addresses WHERE address_id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching address:', err.message, err.stack);
    next(err);
  }
});

// Update an address
router.put('/:id', async (req, res, next) => {
  try {
    const { user_id, street, city, state, zip_code, country, is_default } = req.body;

    // Validate required fields
    if (!street || !city || !state || !zip_code || !country) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    // Verify address exists
    const [address] = await pool.query('SELECT user_id FROM addresses WHERE address_id = ?', [req.params.id]);
    if (address.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Verify user exists if provided
    if (user_id) {
      const [user] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    // If is_default is true, unset other default addresses for the user
    if (is_default && user_id) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND address_id != ?', [user_id, req.params.id]);
    }

    const [result] = await pool.query(
      'UPDATE addresses SET user_id = ?, street = ?, city = ?, state = ?, zip_code = ?, country = ?, is_default = ? WHERE address_id = ?',
      [user_id || null, street, city, state, zip_code, country, is_default || false, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({
      address_id: parseInt(req.params.id),
      user_id,
      street,
      city,
      state,
      zip_code,
      country,
      is_default: is_default || false,
      message: 'Address updated successfully',
    });
  } catch (err) {
    console.error('Error updating address:', err.message, err.stack);
    next(err);
  }
});

// Delete an address
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM addresses WHERE address_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Error deleting address:', err.message, err.stack);
    next(err);
  }
});

module.exports = router;
