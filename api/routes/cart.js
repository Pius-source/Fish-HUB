const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get cart for user
router.get('/:userId', (req, res) => {
  try {
    const carts = db.getCart();
    const cart = carts[req.params.userId] || { userId: req.params.userId, items: [] };
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/:userId/add', (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity required' });
    }

    // Verify product exists
    const products = db.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const carts = db.getCart();
    const userId = req.params.userId;

    if (!carts[userId]) {
      carts[userId] = { userId, items: [] };
    }

    // Check if item already in cart
    const existingItem = carts[userId].items.find(i => i.productId === productId);

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      carts[userId].items.push({
        id: Math.random().toString(36),
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: parseInt(quantity),
        sellerId: product.sellerId
      });
    }

    // Calculate total
    carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    db.saveCart(carts);

    res.json({
      message: 'Item added to cart',
      cart: carts[userId]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item
router.put('/:userId/update', (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const carts = db.getCart();
    const userId = req.params.userId;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = carts[userId].items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    if (quantity <= 0) {
      carts[userId].items.splice(itemIndex, 1);
    } else {
      carts[userId].items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    db.saveCart(carts);

    res.json({
      message: 'Cart updated',
      cart: carts[userId]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/:userId/remove/:itemId', (req, res) => {
  try {
    const carts = db.getCart();
    const userId = req.params.userId;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    carts[userId].items = carts[userId].items.filter(i => i.id !== req.params.itemId);
    carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    db.saveCart(carts);

    res.json({
      message: 'Item removed from cart',
      cart: carts[userId]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart
router.delete('/:userId/clear', (req, res) => {
  try {
    const carts = db.getCart();
    const userId = req.params.userId;

    if (carts[userId]) {
      carts[userId].items = [];
      carts[userId].total = 0;
      db.saveCart(carts);
    }

    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
