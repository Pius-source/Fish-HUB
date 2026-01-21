const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./api/routes/auth');
const productRoutes = require('./api/routes/products');
const cartRoutes = require('./api/routes/cart');
const orderRoutes = require('./api/routes/orders');
const sellerRoutes = require('./api/routes/sellers');
const reviewRoutes = require('./api/routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Fish Hub API is running ✅' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🐟 Fish Hub Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
