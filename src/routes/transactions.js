const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching transactions with cart items');
    const { status_id } = req.query;
    let query = `
      SELECT
        t.transaction_id,
        t.transaction_date,
        t.status_id,
        l.display AS status,
        t.address_id,
        a.street,
        a.city,
        a.state,
        a.zip_code,
        a.country,
        c.cart_item_id,
        c.quantity,
        m.name AS item_name,
        m.price,
        cat.display AS category,
        COALESCE((
          SELECT SUM(ci.quantity * mi.price)
          FROM restaurant.cart_items ci
          JOIN restaurant.menu_items mi ON ci.menu_item_id = mi.menu_item_id
          WHERE ci.transaction_id = t.transaction_id
        ), 0) AS total_amount
      FROM restaurant.transactions t
      LEFT JOIN restaurant.lookup l ON t.status_id = l.id
      LEFT JOIN restaurant.addresses a ON t.address_id = a.address_id
      LEFT JOIN restaurant.cart_items c ON t.transaction_id = c.transaction_id
      LEFT JOIN restaurant.menu_items m ON c.menu_item_id = m.menu_item_id
      LEFT JOIN restaurant.lookup cat ON m.category_id = cat.id
    `;
    const params = [];
    if (status_id) {
      query += ` WHERE t.status_id = $1`;
      params.push(status_id);
    }
    query += ` ORDER BY t.transaction_id`;

    const { rows } = await pool.query(query, params);

    // Group items by transaction
    const transactions = [];
    const transactionMap = new Map();

    for (const row of rows) {
      if (!transactionMap.has(row.transaction_id)) {
        transactionMap.set(row.transaction_id, {
          transaction_id: row.transaction_id,
          transaction_date: row.transaction_date,
          total_amount: parseFloat(row.total_amount) || 0,
          status_id: row.status_id,
          status: row.status,
          address_id: row.address_id,
          street: row.street,
          city: row.city,
          state: row.state,
          zip_code: row.zip_code,
          country: row.country,
          cart_items: [],
        });
        transactions.push(transactionMap.get(row.transaction_id));
      }
      if (row.cart_item_id) {
        transactionMap.get(row.transaction_id).cart_items.push({
          cart_item_id: row.cart_item_id,
          quantity: row.quantity,
          item_name: row.item_name,
          price: parseFloat(row.price) || 0,
          category: row.category,
        });
      }
    }

    console.log('Transactions query result:', Array.from(transactionMap.values()));
    res.json(Array.from(transactionMap.values()));
  } catch (err) {
    console.error('Error fetching transactions:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch transactions', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching transaction:', req.params.id);
    const { rows } = await pool.query(`
      SELECT
        t.transaction_id,
        t.transaction_date,
        t.status_id,
        l.display AS status,
        t.address_id,
        a.street,
        a.city,
        a.state,
        a.zip_code,
        a.country,
        c.cart_item_id,
        c.quantity,
        m.name AS item_name,
        m.price,
        cat.display AS category,
        COALESCE((
          SELECT SUM(ci.quantity * mi.price)
          FROM restaurant.cart_items ci
          JOIN restaurant.menu_items mi ON ci.menu_item_id = mi.menu_item_id
          WHERE ci.transaction_id = t.transaction_id
        ), 0) AS total_amount
      FROM restaurant.transactions t
      LEFT JOIN restaurant.lookup l ON t.status_id = l.id
      LEFT JOIN restaurant.addresses a ON t.address_id = a.address_id
      LEFT JOIN restaurant.cart_items c ON t.transaction_id = c.transaction_id
      LEFT JOIN restaurant.menu_items m ON c.menu_item_id = m.menu_item_id
      LEFT JOIN restaurant.lookup cat ON m.category_id = cat.id
      WHERE t.transaction_id = $1
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const transaction = rows[0];
    const cartItems = rows.map(row => ({
      cart_item_id: row.cart_item_id,
      quantity: row.quantity,
      item_name: row.item_name,
      price: parseFloat(row.price) || 0,
      category: row.category
    })).filter(item => item.cart_item_id);
    res.json({
      transaction_id: transaction.transaction_id,
      transaction_date: transaction.transaction_date,
      total_amount: parseFloat(transaction.total_amount) || 0,
      status_id: transaction.status_id,
      status: transaction.status,
      address_id: transaction.address_id,
      street: transaction.street,
      city: transaction.city,
      state: transaction.state,
      zip_code: transaction.zip_code,
      country: transaction.country,
      cart_items: cartItems
    });
  } catch (err) {
    console.error('Error fetching transaction:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch transaction', message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { total_amount, status_id } = req.body;
  console.log('Received transaction creation request:', req.body);
  try {
    const { rows } = await pool.query(`
      INSERT INTO restaurant.transactions (total_amount, status_id, transaction_date)
      VALUES ($1, $2, NOW())
      RETURNING transaction_id
    `, [total_amount || 0, status_id || 7]);
    res.json({ transaction_id: rows[0].transaction_id });
  } catch (err) {
    console.error('Error creating transaction:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create transaction', message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { status_id, address_id, total_amount } = req.body;
  try {
    if (!status_id && !address_id && total_amount === undefined) {
      return res.status(400).json({ 
        error: 'Must provide at least one of status_id, address_id, or total_amount to update' 
      });
    }

    if (status_id) {
      const { rows: statusRows } = await pool.query(
        'SELECT id FROM restaurant.lookup WHERE id = $1 AND group_name = $2',
        [status_id, 'Order Status']
      );
      if (statusRows.length === 0) {
        return res.status(400).json({ error: 'Invalid status_id' });
      }
    }

    const updates = [];
    const params = [];
    
    if (status_id) {
      updates.push('status_id = $1');
      params.push(status_id);
    }
    
    if (address_id) {
      updates.push(`address_id = $${params.length + 1}`);
      params.push(address_id);
    }
    
    if (total_amount !== undefined) {
      updates.push(`total_amount = $${params.length + 1}`);
      params.push(total_amount || 0);
    }
    
    params.push(req.params.id);

    const { rowCount } = await pool.query(
      `UPDATE restaurant.transactions SET ${updates.join(', ')} WHERE transaction_id = $${params.length}`,
      params
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    console.error('Error updating transaction:', err.message, err.stack);
    res.status(500).json({ 
      error: 'Failed to update transaction',
      details: err.message 
    });
  }
});

module.exports = router;
