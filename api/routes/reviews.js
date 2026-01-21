const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', verifyToken, (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify user purchased the product
    const orders = db.getOrders();
    const order = orders.find(o => o.id === orderId && o.userId === req.user.id);

    if (!order) {
      return res.status(403).json({ error: 'Can only review purchased products' });
    }

    const newReview = {
      id: uuidv4(),
      productId,
      orderId,
      userId: req.user.id,
      userName: req.user.email,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      helpful: 0
    };

    // Save review
    const reviews = db.getReviews();
    reviews.push(newReview);
    db.saveReviews(reviews);

    // Update product rating
    const products = db.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
      const productReviews = reviews.filter(r => r.productId === productId);
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

      products[productIndex].rating = parseFloat(avgRating.toFixed(1));
      products[productIndex].totalReviews = productReviews.length;
      db.saveProducts(products);
    }

    res.status(201).json({
      message: 'Review posted successfully',
      review: newReview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product reviews
router.get('/product/:productId', (req, res) => {
  try {
    const reviews = db.getReviews().filter(r => r.productId === req.params.productId);

    // Sort by helpful count
    reviews.sort((a, b) => b.helpful - a.helpful);

    res.json({
      total: reviews.length,
      reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's reviews
router.get('/user/me', verifyToken, (req, res) => {
  try {
    const reviews = db.getReviews().filter(r => r.userId === req.user.id);

    res.json({
      total: reviews.length,
      reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark review as helpful
router.put('/:reviewId/helpful', (req, res) => {
  try {
    const reviews = db.getReviews();
    const reviewIndex = reviews.findIndex(r => r.id === req.params.reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    reviews[reviewIndex].helpful += 1;
    db.saveReviews(reviews);

    res.json({
      message: 'Review marked as helpful',
      review: reviews[reviewIndex]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
