// API Configuration
// Dynamically set API URL based on environment. Use same origin for non-localhost pages.
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Current Host:', window.location.hostname);

/**
 * Safely parse fetch responses. If response is JSON, returns { data, isJson:true }.
 * Otherwise returns { data: null, isJson:false, text } with body text for debugging.
 */
async function safeParseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return { data, isJson: true };
    } catch (err) {
      const text = await response.text();
      return { data: null, isJson: false, text };
    }
  } else {
    const text = await response.text();
    return { data: null, isJson: false, text };
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const parsed = await safeParseResponse(response);
  return { ok: response.ok, status: response.status, data: parsed.data, text: parsed.text, isJson: parsed.isJson };
}

// Normalize server errors: strip HTML and shorten long bodies
function formatError(response, parsed) {
  if (parsed.isJson) {
    if (parsed.data && parsed.data.error) return parsed.data.error;
    if (typeof parsed.data === 'string') return parsed.data;
    return 'Invalid JSON response from server';
  }
  const text = (parsed.text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const short = text.length > 200 ? text.slice(0,197) + '...' : text;
  return `Server returned ${response.status} ${response.statusText}${short ? ' - ' + short : ''}`;
}

// Auth Manager
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user')) || null;
    console.log('🔑 AuthManager initialized');
    console.log('   Token exists:', !!this.token);
    console.log('   User exists:', !!this.user);
  }

  async register(email, password, name, phone, role = 'buyer') {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      const payload = { email, password, name, phone, role };
      
      console.log('📨 Sending register request to:', url);
      console.log('   Payload:', { email, name, phone, role, password: '***' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('   Response status:', response.status);
      console.log('   Response ok:', response.ok);

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from', url, 'status:', response.status, 'body:', parsed.text);
      }
      console.log('   Response data:', data ?? parsed.text);

      if (response.ok) {
        if (!data) {
          console.error('❌ Register failed: server did not return valid JSON');
          return { success: false, error: 'Invalid JSON response from server' };
        }
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('✅ Register successful, token stored');
        return { success: true, data };
      }

      const serverErr = (data && data.error) || formatError(response, parsed) || 'Unknown error';
      console.log('❌ Register failed:', serverErr);
      return { success: false, error: serverErr };
    } catch (err) {
      console.error('❌ Register exception:', err);
      return { success: false, error: err.message };
    }
  }

  async login(email, password) {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      const payload = { email, password };
      
      console.log('📧 Sending login request to:', url);
      console.log('   Payload:', { email, password: '***' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('   Response status:', response.status);
      console.log('   Response ok:', response.ok);

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from', url, 'status:', response.status, 'body:', parsed.text);
      }
      console.log('   Response data:', data ?? parsed.text);

      if (response.ok) {
        if (!data) {
          console.error('❌ Login failed: server did not return valid JSON');
          return { success: false, error: 'Invalid JSON response from server' };
        }
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('✅ Login successful, token stored');
        return { success: true, data };
      }

      const serverErr = (data && data.error) || formatError(response, parsed) || 'Unknown error';
      console.log('❌ Login failed:', serverErr);
      return { success: false, error: serverErr };
    } catch (err) {
      console.error('❌ Login exception:', err);
      return { success: false, error: err.message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return !!this.token;
  }

  async updateProfile(name, phone, addresses) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ name, phone, addresses })
      });

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from updateProfile, status:', response.status, 'body:', parsed.text);
      }

      if (response.ok) {
        if (!data) return { success: false, error: 'Invalid JSON response from server' };
        this.user = data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, data };
      }

      return { success: false, error: (data && data.error) || formatError(response, parsed) || 'Unknown error' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Cart Manager
class CartManager {
  constructor(userId) {
    this.userId = userId;
    this.cart = this.loadCart();
  }

  loadCart() {
    return JSON.parse(localStorage.getItem(`cart_${this.userId}`)) || { userId: this.userId, items: [], total: 0 };
  }

  saveCart() {
    localStorage.setItem(`cart_${this.userId}`, JSON.stringify(this.cart));
  }

  addItem(product, quantity = 1) {
    const existingItem = this.cart.items.find(i => i.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({
        id: Math.random().toString(36),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        sellerId: product.sellerId
      });
    }

    this.calculateTotal();
    this.saveCart();
    return this.cart;
  }

  removeItem(itemId) {
    this.cart.items = this.cart.items.filter(i => i.id !== itemId);
    this.calculateTotal();
    this.saveCart();
    return this.cart;
  }

  updateQuantity(itemId, quantity) {
    const item = this.cart.items.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.calculateTotal();
        this.saveCart();
      }
    }
    return this.cart;
  }

  calculateTotal() {
    this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCart() {
    return this.cart;
  }

  clear() {
    this.cart.items = [];
    this.cart.total = 0;
    this.saveCart();
  }

  getItemCount() {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

// Product Manager
class ProductManager {
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetchJson(`${API_BASE_URL}/products?${params}`);
      if (res.isJson) return res.data;
      console.warn('⚠️ Expected JSON from getProducts, body:', res.text);
      return { total: 0, products: [] };
    } catch (err) {
      console.error('Error fetching products:', err);
      return { total: 0, products: [] };
    }
  }

  async getProduct(id) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/products/${id}`);
      if (res.isJson) return res.data;
      console.warn('⚠️ Expected JSON from getProduct, body:', res.text);
      return null;
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  }

  async createProduct(product, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from createProduct, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error creating product:', err);
      return { error: err.message };
    }
  }

  async updateProduct(id, product, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from updateProduct, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error updating product:', err);
      return { error: err.message };
    }
  }

  async getCategories() {
    try {
      const res = await fetchJson(`${API_BASE_URL}/products/categories/all`);
      if (res.isJson) return res.data;
      console.warn('⚠️ Expected JSON from getCategories, body:', res.text);
      return [] ;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }

  async addProduct(product) {
    try {
      const token = auth.getToken();
      if (!token) {
        return { error: 'No token provided' };
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from addProduct, status:', response.status, 'body:', parsed.text);
      }

      if (response.ok) {
        if (!data) return { error: 'Invalid JSON response from server' };
        return { success: true, data };
      }

      return { error: (data && data.error) || formatError(response, parsed) || 'Failed to add product' };
    } catch (err) {
      console.error('Error adding product:', err);
      return { error: err.message };
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from deleteProduct, status:', response.status, 'body:', parsed.text);
      }

      if (response.ok) {
        return { success: true };
      }

      return { error: (data && data.error) || formatError(response, parsed) || 'Failed to delete product' };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { error: err.message };
    }
  }

  async getSellerProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/me/dashboard`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });

      const parsed = await safeParseResponse(response);
      const data = parsed.data;
      if (!parsed.isJson) {
        console.warn('⚠️ Expected JSON from getSellerProducts, status:', response.status, 'body:', parsed.text);
      }

      if (response.ok) {
        if (!data) return { products: [], error: 'Invalid JSON response from server' };
        return { products: data.products || [], seller: data.seller, stats: data.stats };
      }

      return { products: [], error: (data && data.error) || formatError(response, parsed) || 'Failed to fetch seller products' };
    } catch (err) {
      console.error('Error fetching seller products:', err);
      return { products: [], error: err.message };
    }
  }
}

// Order Manager
class OrderManager {
  constructor(token) {
    this.token = token;
  }

  async createOrder(userId, deliveryAddress, paymentMethod, items) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          userId,
          deliveryAddress,
          paymentMethod,
          items
        })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from createOrder, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error creating order:', err);
      return { error: err.message };
    }
  }

  async getUserOrders(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getUserOrders, body:', parsed.text);
      return { total: 0, orders: [] };
    } catch (err) {
      console.error('Error fetching orders:', err);
      return { total: 0, orders: [] };
    }
  }

  async getOrder(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getOrder, body:', parsed.text);
      return null;
    } catch (err) {
      console.error('Error fetching order:', err);
      return null;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ status })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from updateOrderStatus, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error updating order status:', err);
      return { error: err.message };
    }
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ paymentStatus })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from updatePaymentStatus, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error updating payment status:', err);
      return { error: err.message };
    }
  }

  async getSellerOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/seller`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getSellerOrders, body:', parsed.text);
      return { orders: [] };
    } catch (err) {
      console.error('Error fetching seller orders:', err);
      return { orders: [] };
    }
  }
}

// Review Manager
class ReviewManager {
  constructor(token) {
    this.token = token;
  }

  async createReview(productId, orderId, rating, comment) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ productId, orderId, rating, comment })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from createReview, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error creating review:', err);
      return { error: err.message };
    }
  }

  async getProductReviews(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getProductReviews, body:', parsed.text);
      return { total: 0, reviews: [] };
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return { total: 0, reviews: [] };
    }
  }

  async getUserReviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/user/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getUserReviews, body:', parsed.text);
      return { total: 0, reviews: [] };
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      return { total: 0, reviews: [] };
    }
  }

  async markHelpful(reviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'PUT'
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from markHelpful, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error marking review:', err);
      return { error: err.message };
    }
  }
}

// Seller Manager
class SellerManager {
  constructor(token) {
    this.token = token;
  }

  async registerSeller(shopName, description, phone, address) {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ shopName, description, phone, address })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from registerSeller, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error registering seller:', err);
      return { error: err.message };
    }
  }

  async getSellerDashboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/me/dashboard`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getSellerDashboard, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      return { error: err.message };
    }
  }

  async getSeller(sellerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getSeller, body:', parsed.text);
      return null;
    } catch (err) {
      console.error('Error fetching seller:', err);
      return null;
    }
  }

  async getAllSellers() {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers`);
      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from getAllSellers, body:', parsed.text);
      return { total: 0, sellers: [] };
    } catch (err) {
      console.error('Error fetching sellers:', err);
      return { total: 0, sellers: [] };
    }
  }

  async updateSellerProfile(sellerId, shopName, description, phone, address) {
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ shopName, description, phone, address })
      });

      const parsed = await safeParseResponse(response);
      if (parsed.isJson) return parsed.data;
      console.warn('⚠️ Expected JSON from updateSellerProfile, body:', parsed.text);
      return { error: formatError(response, parsed) || 'Invalid response from server' };
    } catch (err) {
      console.error('Error updating seller:', err);
      return { error: err.message };
    }
  }
}

// Initialize global instances
const auth = new AuthManager();
const productManager = new ProductManager();
const reviewManager = auth.isLoggedIn() ? new ReviewManager(auth.getToken()) : null;
const orderManager = auth.isLoggedIn() ? new OrderManager(auth.getToken()) : null;
const sellerManager = auth.isLoggedIn() ? new SellerManager(auth.getToken()) : null;

let cartManager = null;
if (auth.isLoggedIn()) {
  cartManager = new CartManager(auth.getUser().id);
}
