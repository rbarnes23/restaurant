const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT user_id, username, email, role
      FROM restaurant.users
      ORDER BY username
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message, err.stack);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: err.message
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  const { username, email, role } = req.body;
  try {
    if (!username || !email || !role) {
      return res.status(400).json({ error: 'Username, email, and role are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.users (username, email, role)
      VALUES ($1, $2, $3)
      RETURNING user_id
    `, [username, email, role]);

    res.status(201).json({
      user_id: rows[0].user_id,
      username,
      email,
      role
    });
  } catch (err) {
    console.error('Error creating user:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { username, email, role } = req.body;
  try {
    if (!username || !email || !role) {
      return res.status(400).json({ error: 'Username, email, and role are required' });
    }

    const { rowCount } = await pool.query(`
      UPDATE restaurant.users
      SET username = $1, email = $2, role = $3
      WHERE user_id = $4
    `, [username, email, role, req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.users
      WHERE user_id = $1
    `, [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

module.exports = router;
