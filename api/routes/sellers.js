const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { verifySeller, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Register as seller
router.post('/register', verifyToken, (req, res) => {
  try {
    const { shopName, description, phone, address } = req.body;

    if (!shopName || !phone || !address) {
      return res.status(400).json({ error: 'Shop name, phone, and address are required' });
    }

    const sellers = db.getSellers();

    // Check if already a seller
    if (sellers.find(s => s.userId === req.user.id)) {
      return res.status(400).json({ error: 'User is already a seller' });
    }

    const newSeller = {
      id: uuidv4(),
      userId: req.user.id,
      shopName,
      description: description || '',
      phone,
      address,
      rating: 0,
      totalReviews: 0,
      totalSales: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      verified: false
    };

    sellers.push(newSeller);
    db.saveSellers(sellers);

    // Update user role
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].role = 'seller';
      db.saveUsers(users);
    }

    res.status(201).json({
      message: 'Seller profile created successfully',
      seller: newSeller
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get seller profile
router.get('/:sellerId', (req, res) => {
  try {
    const sellers = db.getSellers();
    const seller = sellers.find(s => s.id === req.params.sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Get seller's products
    const products = db.getProducts().filter(p => p.sellerId === seller.id);

    res.json({
      ...seller,
      productCount: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current seller's profile
router.get('/me/dashboard', verifySeller, (req, res) => {
  try {
    const sellers = db.getSellers();
    const seller = sellers.find(s => s.userId === req.user.id);

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Get seller's products
    const products = db.getProducts().filter(p => p.sellerId === seller.id);

    // Get seller's orders
    const orders = db.getOrders().filter(o => 
      o.items.some(item => products.some(p => p.id === item.productId))
    );

    // Calculate stats
    const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
    const totalSales = orders.length;

    res.json({
      seller,
      stats: {
        productCount: products.length,
        totalOrders: totalSales,
        totalEarnings,
        averageRating: seller.rating
      },
      recentOrders: orders.slice(-5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update seller profile
router.put('/:sellerId', verifySeller, (req, res) => {
  try {
    const { shopName, description, phone, address } = req.body;
    const sellers = db.getSellers();
    const sellerIndex = sellers.findIndex(s => s.id === req.params.sellerId);

    if (sellerIndex === -1) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const seller = sellers[sellerIndex];

    // Verify ownership
    if (seller.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own profile' });
    }

    if (shopName) seller.shopName = shopName;
    if (description) seller.description = description;
    if (phone) seller.phone = phone;
    if (address) seller.address = address;

    db.saveSellers(sellers);

    res.json({
      message: 'Seller profile updated',
      seller
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sellers (for buyer browsing)
router.get('/', (req, res) => {
  try {
    const sellers = db.getSellers();
    const sellerList = sellers.map(s => {
      const products = db.getProducts().filter(p => p.sellerId === s.id);
      return {
        ...s,
        productCount: products.length
      };
    });

    res.json({
      total: sellerList.length,
      sellers: sellerList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
