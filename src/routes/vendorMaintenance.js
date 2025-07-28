const express = require('express');
const router = express.Router();
const pool = require('../db');

// Validate email format
const isValidEmail = (email) => {
  return /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/i.test(email);
};

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT vendor_id, vendor_name, contact_person, email, phone, alternate_phone, website,
             address_line1, address_line2, city, state_province, postal_code, country,
             tax_id, business_registration_number, vendor_since, vendor_category,
             payment_terms, preferred_payment_method, currency_preference, credit_limit,
             is_active, notes, rating, created_at, updated_at
      FROM restaurant.vendors
      ORDER BY vendor_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vendors:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch vendors', details: err.message });
  }
});

// Create new vendor
router.post('/', async (req, res) => {
  const {
    vendor_name, contact_person, email, phone, alternate_phone, website,
    address_line1, address_line2, city, state_province, postal_code, country,
    tax_id, business_registration_number, vendor_since, vendor_category,
    payment_terms, preferred_payment_method, currency_preference, credit_limit,
    is_active, notes, rating
  } = req.body;

  try {
    // Validate required fields
    if (!vendor_name || !email) {
      return res.status(400).json({ error: 'Vendor name and email are required' });
    }
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Validate currency_preference
    if (currency_preference && !/^[A-Z]{3}$/.test(currency_preference)) {
      return res.status(400).json({ error: 'Currency preference must be a 3-letter code' });
    }

    const { rows } = await pool.query(`
      INSERT INTO restaurant.vendors (
        vendor_name, contact_person, email, phone, alternate_phone, website,
        address_line1, address_line2, city, state_province, postal_code, country,
        tax_id, business_registration_number, vendor_since, vendor_category,
        payment_terms, preferred_payment_method, currency_preference, credit_limit,
        is_active, notes, rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING vendor_id
    `, [
      vendor_name,
      contact_person || null,
      email,
      phone || null,
      alternate_phone || null,
      website || null,
      address_line1 || null,
      address_line2 || null,
      city || null,
      state_province || null,
      postal_code || null,
      country || null,
      tax_id || null,
      business_registration_number || null,
      vendor_since || null,
      vendor_category || null,
      payment_terms || null,
      preferred_payment_method || null,
      currency_preference || 'USD',
      credit_limit ? parseFloat(credit_limit) : null,
      is_active !== undefined ? is_active : true,
      notes || null,
      rating ? parseInt(rating) : null
    ]);

    res.status(201).json({
      vendor_id: rows[0].vendor_id,
      vendor_name,
      contact_person,
      email,
      phone,
      alternate_phone,
      website,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      tax_id,
      business_registration_number,
      vendor_since,
      vendor_category,
      payment_terms,
      preferred_payment_method,
      currency_preference: currency_preference || 'USD',
      credit_limit,
      is_active: is_active !== undefined ? is_active : true,
      notes,
      rating
    });
  } catch (err) {
    console.error('Error creating vendor:', err.message, err.stack);
    if (err.code === '23505') { // Unique violation (email)
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create vendor', details: err.message });
  }
});

// Update vendor
router.put('/:id', async (req, res) => {
  const {
    vendor_name, contact_person, email, phone, alternate_phone, website,
    address_line1, address_line2, city, state_province, postal_code, country,
    tax_id, business_registration_number, vendor_since, vendor_category,
    payment_terms, preferred_payment_method, currency_preference, credit_limit,
    is_active, notes, rating
  } = req.body;

  try {
    // Validate required fields
    if (!vendor_name || !email) {
      return res.status(400).json({ error: 'Vendor name and email are required' });
    }
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Validate currency_preference
    if (currency_preference && !/^[A-Z]{3}$/.test(currency_preference)) {
      return res.status(400).json({ error: 'Currency preference must be a 3-letter code' });
    }

    const { rowCount } = await pool.query(`
      UPDATE restaurant.vendors
      SET vendor_name = $1, contact_person = $2, email = $3, phone = $4, alternate_phone = $5, website = $6,
          address_line1 = $7, address_line2 = $8, city = $9, state_province = $10, postal_code = $11, country = $12,
          tax_id = $13, business_registration_number = $14, vendor_since = $15, vendor_category = $16,
          payment_terms = $17, preferred_payment_method = $18, currency_preference = $19, credit_limit = $20,
          is_active = $21, notes = $22, rating = $23, updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = $24
    `, [
      vendor_name,
      contact_person || null,
      email,
      phone || null,
      alternate_phone || null,
      website || null,
      address_line1 || null,
      address_line2 || null,
      city || null,
      state_province || null,
      postal_code || null,
      country || null,
      tax_id || null,
      business_registration_number || null,
      vendor_since || null,
      vendor_category || null,
      payment_terms || null,
      preferred_payment_method || null,
      currency_preference || 'USD',
      credit_limit ? parseFloat(credit_limit) : null,
      is_active !== undefined ? is_active : true,
      notes || null,
      rating ? parseInt(rating) : null,
      req.params.id
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor updated successfully' });
  } catch (err) {
    console.error('Error updating vendor:', err.message, err.stack);
    if (err.code === '23505') { // Unique violation (email)
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update vendor', details: err.message });
  }
});

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM restaurant.vendors
      WHERE vendor_id = $1
    `, [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error('Error deleting vendor:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete vendor', details: err.message });
  }
});

module.exports = router;
