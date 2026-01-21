const jwt = require('jsonwebtoken');

const JWT_SECRET = 'fish-hub-secret-key-2026';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', message: err.message });
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'buyer'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify seller
function verifySeller(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === 'seller' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Seller access required' });
    }
  });
}

module.exports = {
  verifyToken,
  generateToken,
  verifySeller,
  JWT_SECRET
};
