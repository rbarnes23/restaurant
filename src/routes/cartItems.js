const express = require('express');
const router = express.Router();
const pool = require('../db');

// Function to update transaction total_amount
async function updateTransactionTotal(transactionId) {
  try {
    const { rowCount } = await pool.query(`
      UPDATE restaurant.transactions t
      SET total_amount = COALESCE((
        SELECT SUM(c.quantity * m.price)
        FROM restaurant.cart_items c
        JOIN restaurant.menu_items m ON c.menu_item_id = m.menu_item_id
        WHERE c.transaction_id = t.transaction_id
      ), 0)
      WHERE t.transaction_id = $1
    `, [transactionId]);
    console.log(`Updated total_amount for transaction ${transactionId}`);
  } catch (err) {
    console.error(`Error updating total_amount for transaction ${transactionId}:`, err.message, err.stack);
    throw err;
  }
}

router.get('/', async (req, res) => {
  try {
    console.log('Fetching cart items');
    const { transaction_id } = req.query;
    if (!transaction_id) {
      return res.status(400).json({ error: 'transaction_id is required' });
    }
    const { rows } = await pool.query(`
      SELECT c.cart_item_id, c.menu_item_id, c.quantity, c.transaction_id, c.item_name, c.price
      FROM restaurant.cart_items c
      WHERE c.transaction_id = $1
    `, [transaction_id]);
    console.log('Cart items query result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cart items:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch cart items', message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { menu_item_id, quantity, transaction_id } = req.body;
  console.log('Received cart item creation request:', req.body);
  if (!menu_item_id || !quantity || !transaction_id) {
    return res.status(400).json({ error: 'menu_item_id, quantity, and transaction_id are required' });
  }
  try {
    // Fetch item_name and price from menu_items
    const { rows: menuItemRows } = await pool.query(`
      SELECT name AS item_name, price
      FROM restaurant.menu_items
      WHERE menu_item_id = $1
    `, [menu_item_id]);
    if (menuItemRows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    const { item_name, price } = menuItemRows[0];
    if (price == null) {
      return res.status(400).json({ error: 'Menu item price is not defined' });
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.cart_items (menu_item_id, quantity, transaction_id, item_name, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING cart_item_id
    `, [menu_item_id, quantity, transaction_id, item_name, price]);
    await updateTransactionTotal(transaction_id);
    res.json({
      cart_item_id: rows[0].cart_item_id,
      menu_item_id,
      quantity,
      transaction_id,
      item_name,
      price
    });
  } catch (err) {
    console.error('Error creating cart item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create cart item', message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  console.log('Received cart item update request:', req.body);
  if (!quantity) {
    return res.status(400).json({ error: 'quantity is required' });
  }
  try {
    const { rows: cartItemRows } = await pool.query(`
      SELECT transaction_id
      FROM restaurant.cart_items
      WHERE cart_item_id = $1
    `, [req.params.id]);
    if (cartItemRows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const transaction_id = cartItemRows[0].transaction_id;
    const { rowCount } = await pool.query(`
      UPDATE restaurant.cart_items
      SET quantity = $1
      WHERE cart_item_id = $2
    `, [quantity, req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    await updateTransactionTotal(transaction_id);
    res.json({ message: 'Cart item updated successfully' });
  } catch (err) {
    console.error('Error updating cart item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update cart item', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows: cartItemRows } = await pool.query(`
      SELECT transaction_id
      FROM restaurant.cart_items
      WHERE cart_item_id = $1
    `, [req.params.id]);
    if (cartItemRows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const transaction_id = cartItemRows[0].transaction_id;
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.cart_items
      WHERE cart_item_id = $1
    `, [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    await updateTransactionTotal(transaction_id);
    res.json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    console.error('Error deleting cart item:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete cart item', message: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { transaction_id } = req.query;
    if (!transaction_id) {
      return res.status(400).json({ error: 'transaction_id is required' });
    }
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.cart_items
      WHERE transaction_id = $1
    `, [transaction_id]);
    await updateTransactionTotal(transaction_id);
    res.json({ message: `Deleted ${rowCount} cart items` });
  } catch (err) {
    console.error('Error deleting cart items:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete cart items', message: err.message });
  }
});

module.exports = router;
