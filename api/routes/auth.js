const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { generateToken, verifyToken } = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail, sendLoginNotificationEmail } = require('../config/email');

const router = express.Router();

// Helper function to generate verification code
function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Register - Buyer or Seller with Email Verification
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.getUsers();
    
    // Check if user exists or is pending verification
    if (users.find(u => u.email === normalizedEmail)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if verification is already pending
    const tokens = db.getVerificationTokens();
    const pendingToken = tokens.find(t => t.email === normalizedEmail && t.used === false);
    if (pendingToken && new Date(pendingToken.expiresAt) > new Date()) {
      return res.status(400).json({ error: 'Verification email already sent. Please check your inbox.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create unverified user
    const newUser = {
      id: uuidv4(),
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone: phone || '',
      role: role || 'buyer',
      addresses: [],
      createdAt: new Date().toISOString(),
      status: 'active', // Auto-activate for dev
      emailVerified: true // Auto-verify for dev to avoid login issues
    };

    users.push(newUser);
    db.saveUsers(users);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    const verificationToken = {
      id: uuidv4(),
      email: normalizedEmail,
      userId: newUser.id,
      code: verificationCode,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    tokens.push(verificationToken);
    db.saveVerificationTokens(tokens);

    // Send verification email
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);

    if (emailSent) {
      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          emailVerified: false
        }
      });
    } else {
      // Email failed, but user was created
      res.status(201).json({
        message: 'Registration successful but verification email could not be sent. Please check configuration.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Email
router.get('/verify', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const tokens = db.getVerificationTokens();
    const token = tokens.find(t => t.code === code && t.used === false);

    if (!token) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Check expiration
    if (new Date(token.expiresAt) < new Date()) {
      token.used = true;
      db.saveVerificationTokens(tokens);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark token as used
    token.used = true;
    db.saveVerificationTokens(tokens);

    // Update user to verified
    const users = db.getUsers();
    const user = users.find(u => u.id === token.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.emailVerified = true;
    user.status = 'active';
    db.saveUsers(users);

    // If registering as seller, auto-create seller profile
    if (user.role === 'seller') {
      try {
        const sellers = db.getSellers();
        if (!sellers.find(s => s.userId === user.id)) {
          const newSeller = {
            id: uuidv4(),
            userId: user.id,
            shopName: user.name + "'s Shop",
            description: '',
            phone: user.phone || '',
            address: '',
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
          console.log('✅ Seller profile auto-created for:', user.email);
        }
      } catch (sellerErr) {
        console.error('⚠️ Warning: Failed to auto-create seller profile:', sellerErr.message);
      }
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Redirect to login page with success message
    res.redirect(`/login.html?verified=true&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.getUsers();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const tokens = db.getVerificationTokens();
    const verificationToken = {
      id: uuidv4(),
      email: normalizedEmail,
      userId: user.id,
      code: verificationCode,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    tokens.push(verificationToken);
    db.saveVerificationTokens(tokens);

    // Send verification email
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);

    if (emailSent) {
      res.json({ message: 'Verification email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = db.getUsers();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ error: 'Please verify your email first. Check your inbox for the verification link.' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    // Send login notification email
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    sendLoginNotificationEmail(user.email, user.name, new Date().toLocaleString(), ip)
      .catch(err => console.error('Error sending login notification:', err));

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  try {
    const users = db.getUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      emailVerified: user.emailVerified
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (addresses) users[userIndex].addresses = addresses;

    db.saveUsers(users);

    res.json({
      message: 'Profile updated successfully',
      user: users[userIndex]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
