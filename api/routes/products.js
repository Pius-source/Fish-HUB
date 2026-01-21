const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { verifyToken, verifySeller } = require('../middleware/auth');

const router = express.Router();

// Get all products with filters
router.get('/', (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sortBy } = req.query;
    let products = db.getProducts();

    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Filter by price range
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'popular') {
      products.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    }

    res.json({
      total: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const products = db.getProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get reviews for this product
    const reviews = db.getReviews().filter(r => r.productId === product.id);

    res.json({
      ...product,
      reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Seller only)
router.post('/', verifySeller, (req, res) => {
  try {
    const { name, description, price, category, stock, image, origin, imageData } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sellers = db.getSellers();
    const seller = sellers.find(s => s.userId === req.user.id);

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const newProduct = {
      id: uuidv4(),
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      image: image || '🐟',
      imageData: imageData || null,
      origin: origin || 'Fresh Catch',
      sellerId: seller.id,
      sellerName: seller.shopName,
      rating: 0,
      totalReviews: 0,
      totalSold: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const products = db.getProducts();
    products.push(newProduct);
    db.saveProducts(products);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product', message: err.message });
  }
});

// Update product (Seller only)
router.put('/:id', verifySeller, (req, res) => {
  try {
    const { name, description, price, stock, image, origin } = req.body;
    const products = db.getProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];
    const sellers = db.getSellers();
    const seller = sellers.find(s => s.userId === req.user.id);

    // Verify ownership
    if (product.sellerId !== seller.id) {
      return res.status(403).json({ error: 'You can only edit your own products' });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (image) product.image = image;
    if (origin) product.origin = origin;

    db.saveProducts(products);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get('/categories/all', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
