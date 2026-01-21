const fs = require('fs');
const path = require('path');

// Database directory
const DB_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// File paths
const USERS_FILE = path.join(DB_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const SELLERS_FILE = path.join(DB_DIR, 'sellers.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const CART_FILE = path.join(DB_DIR, 'cart.json');
const REVIEWS_FILE = path.join(DB_DIR, 'reviews.json');
const CATEGORIES_FILE = path.join(DB_DIR, 'categories.json');
const VERIFICATION_TOKENS_FILE = path.join(DB_DIR, 'verification_tokens.json');

// Initialize files if they don't exist
function initializeDB() {
  const files = {
    [USERS_FILE]: [],
    [PRODUCTS_FILE]: [],
    [SELLERS_FILE]: [],
    [ORDERS_FILE]: [],
    [CART_FILE]: {},
    [REVIEWS_FILE]: [],
    [VERIFICATION_TOKENS_FILE]: [],
    [CATEGORIES_FILE]: [
      { id: 'cat1', name: 'Fresh Fish', icon: '🐟' },
      { id: 'cat2', name: 'Shellfish', icon: '🦐' },
      { id: 'cat3', name: 'Prepared Meals', icon: '🍲' },
      { id: 'cat4', name: 'Dried Fish', icon: '🐠' },
      { id: 'cat5', name: 'Seafood Mix', icon: '🦑' }
    ]
  };

  Object.entries(files).forEach(([filePath, defaultData]) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      console.log(`✅ Created ${path.basename(filePath)}`);
    }
  });
}

// Read data from JSON files
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return filePath === CART_FILE ? {} : [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return filePath === CART_FILE ? {} : [];
  }
}

// Write data to JSON files
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
}

// Database operations
const db = {
  initializeDB,
  
  // Users
  getUsers: () => readData(USERS_FILE),
  saveUsers: (users) => writeData(USERS_FILE, users),
  
  // Products
  getProducts: () => readData(PRODUCTS_FILE),
  saveProducts: (products) => writeData(PRODUCTS_FILE, products),
  
  // Sellers
  getSellers: () => readData(SELLERS_FILE),
  saveSellers: (sellers) => writeData(SELLERS_FILE, sellers),
  
  // Orders
  getOrders: () => readData(ORDERS_FILE),
  saveOrders: (orders) => writeData(ORDERS_FILE, orders),
  
  // Cart
  getCart: () => readData(CART_FILE),
  saveCart: (cart) => writeData(CART_FILE, cart),
  
  // Reviews
  getReviews: () => readData(REVIEWS_FILE),
  saveReviews: (reviews) => writeData(REVIEWS_FILE, reviews),
  
  // Categories
  getCategories: () => readData(CATEGORIES_FILE),
  saveCategories: (categories) => writeData(CATEGORIES_FILE, categories),

  // Verification Tokens
  getVerificationTokens: () => readData(VERIFICATION_TOKENS_FILE),
  saveVerificationTokens: (tokens) => writeData(VERIFICATION_TOKENS_FILE, tokens)
};

// Initialize database on load
db.initializeDB();

module.exports = db;
