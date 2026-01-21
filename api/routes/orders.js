const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create order from cart
router.post('/', verifyToken, (req, res) => {
  try {
    const { userId, deliveryAddress, paymentMethod, items } = req.body;

    if (!userId || !deliveryAddress || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify stock and calculate total
    const products = db.getProducts();
    let total = 0;

    for (let item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'product'}` });
      }
      total += product.price * item.quantity;
    }

    // Create order
    const orderId = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
    
    const newOrder = {
      id: orderId,
      userId,
      items,
      deliveryAddress,
      paymentMethod,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      trackingNumber: 'TRACK-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days
    };

    // Update product stock
    for (let item of items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
        products[productIndex].totalSold = (products[productIndex].totalSold || 0) + item.quantity;
      }
    }
    db.saveProducts(products);

    // Save order
    const orders = db.getOrders();
    orders.push(newOrder);
    db.saveOrders(orders);

    // Clear cart
    const carts = db.getCart();
    if (carts[userId]) {
      carts[userId].items = [];
      carts[userId].total = 0;
      db.saveCart(carts);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's orders
router.get('/user/:userId', verifyToken, (req, res) => {
  try {
    const orders = db.getOrders();
    const userOrders = orders.filter(o => o.userId === req.params.userId);

    res.json({
      total: userOrders.length,
      orders: userOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order
router.get('/:orderId', verifyToken, (req, res) => {
  try {
    const orders = db.getOrders();
    const order = orders.find(o => o.id === req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (Admin/Seller)
router.put('/:orderId/status', verifyToken, (req, res) => {
  try {
    const { status } = req.body;
    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    db.saveOrders(orders);

    res.json({
      message: 'Order status updated',
      order: orders[orderIndex]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment status
router.put('/:orderId/payment', verifyToken, (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const orders = db.getOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    orders[orderIndex].paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      orders[orderIndex].status = 'confirmed';
    }
    orders[orderIndex].updatedAt = new Date().toISOString();

    db.saveOrders(orders);

    res.json({
      message: 'Payment status updated',
      order: orders[orderIndex]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
