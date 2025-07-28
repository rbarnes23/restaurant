const express = require('express');
const path = require('path');
const fs = require('fs');
const menuItems = require('./routes/menuItems.js');
const cartItems = require('./routes/cartItems.js');
const transactions = require('./routes/transactions.js');
const addresses = require('./routes/addresses.js');
const statuses = require('./routes/statuses.js');
const categories = require('./routes/categories.js');
const menuMaintenance = require('./routes/menuMaintenance.js');
const maintenanceOptions = require('./routes/maintenanceOptions.js');
const lookupMaintenance = require('./routes/lookupMaintenance.js');
const userMaintenance = require('./routes/userMaintenance.js');
const addressMaintenance = require('./routes/addressMaintenance.js');
const inventoryRouter = require('./routes/inventory.js');
const recipesRouter = require('./routes/recipes.js');
const ingredients = require('./routes/ingredients.js');
const vendorMaintenance = require('./routes/vendorMaintenance');
const inventory = require('./routes/inventory');
const cors = require('cors');
const db = require('./db.js'); // Import PostgreSQL pool for connection check

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// API routes
app.use('/api/menu-items', menuItems);
app.use('/api/cart-items', cartItems);
app.use('/api/transactions', transactions);
app.use('/api/addresses', addresses);
app.use('/api/statuses', statuses);
app.use('/api/categories', categories);
app.use('/api/menu-maintenance', menuMaintenance);
app.use('/api/maintenance-options', maintenanceOptions);
app.use('/api/lookup-maintenance', lookupMaintenance);
app.use('/api/user-maintenance', userMaintenance);
app.use('/api/address-maintenance', addressMaintenance);
//app.use('/api/inventory', inventoryRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/ingredients', ingredients);
app.use('/api/vendor-maintenance', vendorMaintenance);
app.use('/api/inventory', inventory);

// Serve static pages
app.get('/', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  if (!fs.existsSync(filePath)) {
    return next(new Error('index.html not found'));
  }
  res.sendFile(filePath);
});

app.get('/orders', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'orders.html');
  if (!fs.existsSync(filePath)) {
    return next(new Error('orders.html not found'));
  }
  res.sendFile(filePath);
});

app.get('/maintenance', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'maintenance.html');
  if (!fs.existsSync(filePath)) {
    return next(new Error('maintenance.html not found'));
  }
  res.sendFile(filePath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Request:', req.method, req.url, req.query, req.body);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Verify database connection
  try {
    const client = await db.connect();
    console.log('Database connection verified');
    client.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});
