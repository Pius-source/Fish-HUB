# 🐟 Fish Hub - E-commerce Marketplace Platform

A complete Jumia-like e-commerce platform built with Node.js, Express, and vanilla JavaScript.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Register/Login (Buyer & Seller)
- ✅ **Product Management** - Browse, search, filter products
- ✅ **Shopping Cart** - Add/remove items, quantity management
- ✅ **Checkout System** - Complete order placement
- ✅ **Order Management** - Track orders in real-time
- ✅ **Reviews & Ratings** - Customer feedback system
- ✅ **Seller Dashboard** - Manage products and orders
- ✅ **Payment Integration** - Support for multiple payment methods

### Advanced Features
- 🔍 **Advanced Search** - Search by name, price, category
- 📊 **Product Filtering** - Filter by price, category, rating
- 🏪 **Multi-Seller Support** - Multiple sellers on one platform
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔒 **Secure Authentication** - JWT token-based auth
- 📦 **Inventory Management** - Stock tracking

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Responsive design
- No frameworks (lightweight)

**Backend:**
- Node.js + Express
- JWT Authentication
- JSON file storage (no database required)
- RESTful API

**Database:**
- JSON files (easy to deploy, no setup)
- Easy to migrate to SQL later

## 📦 Installation

### Prerequisites
- Node.js 14+ installed
- Windows/Mac/Linux

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will run on `http://localhost:5000`

## 📂 Project Structure

```
fish-hub/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── index.html               # Home page
├── login.html               # Login/Register page
├── cart.html                # Shopping cart page
├── checkout.html            # Checkout page
├── index.css                # Styles
├── api/
│   ├── config/
│   │   └── database.js      # JSON database management
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   └── routes/
│       ├── auth.js          # User auth endpoints
│       ├── products.js      # Product endpoints
│       ├── cart.js          # Cart endpoints
│       ├── orders.js        # Order endpoints
│       ├── sellers.js       # Seller endpoints
│       └── reviews.js       # Review endpoints
└── js/
    ├── api-client.js        # API client classes
    ├── login-handler.js     # Login form handler
    ├── cart-handler.js      # Cart management
    └── checkout-handler.js  # Checkout handler
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product (sellers only)
- `GET /api/products/categories/all` - Get categories

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/:userId/add` - Add item to cart
- `PUT /api/cart/:userId/update` - Update cart item
- `DELETE /api/cart/:userId/remove/:itemId` - Remove item
- `DELETE /api/cart/:userId/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/:orderId` - Get single order
- `PUT /api/orders/:orderId/status` - Update status
- `PUT /api/orders/:orderId/payment` - Update payment

### Sellers
- `POST /api/sellers/register` - Register as seller
- `GET /api/sellers/me/dashboard` - Seller dashboard
- `GET /api/sellers/:sellerId` - Get seller profile
- `GET /api/sellers` - Get all sellers
- `PUT /api/sellers/:sellerId` - Update seller profile

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/user/me` - Get user's reviews
- `PUT /api/reviews/:reviewId/helpful` - Mark as helpful

## 👥 User Roles

### Buyer
- Browse products
- Add to cart
- Place orders
- Track deliveries
- Write reviews
- Manage addresses

### Seller
- Register seller account
- Add/edit products
- Manage inventory
- View orders
- Track earnings
- Confirm shipments

## 🧪 Testing the System

### Test User 1 (Buyer)
```
Email: buyer@fishhub.com
Password: password123
Name: John Buyer
Phone: 0123456789
Role: Buyer
```

### Test User 2 (Seller)
```
Email: seller@fishhub.com
Password: password123
Name: Fish Seller Ltd
Phone: 0987654321
Role: Seller
```

### Test Products (You can add via API)
```
POST /api/products
{
  "name": "Fresh Salmon",
  "price": 5000,
  "category": "Fresh Fish",
  "stock": 50,
  "description": "Premium Atlantic Salmon"
}
```

## 💾 Data Storage

All data is stored in JSON files in the `/data` directory:
- `users.json` - User accounts
- `products.json` - Product catalog
- `orders.json` - Customer orders
- `sellers.json` - Seller profiles
- `reviews.json` - Product reviews
- `cart.json` - Shopping carts

**Note:** This is perfect for development. For production, migrate to MongoDB, PostgreSQL, or MySQL.

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected seller routes
- ✅ User verification for orders
- ✅ CORS enabled for API

## 📝 Adding Sample Products

The system comes with sample categories. To add products:

1. Register as a seller
2. Use the seller dashboard
3. Add products via the API or admin panel

Sample product creation:
```javascript
// Use API client
const productManager = new ProductManager();
await productManager.createProduct({
  name: "Fresh Fish",
  price: 5000,
  category: "Fresh Fish",
  stock: 50,
  description: "Premium fresh fish"
}, token);
```

## 🚀 Deployment

### To Heroku
```bash
heroku create your-app-name
git push heroku main
```

### To DigitalOcean
1. Create a Droplet (Node.js)
2. Upload files via SSH
3. Install dependencies
4. Run with PM2 for process management

### To AWS
1. Use Elastic Beanstalk
2. Configure environment variables
3. Deploy with `eb deploy`

## 📱 Mobile Responsiveness

The platform is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🔧 Configuration

Edit `server.js` to change:
- **Port**: Default `5000`
- **CORS Origin**: Default allows all
- **JWT Secret**: Change in `api/middleware/auth.js`

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
# Change port in server.js
```

### Products not showing
- Ensure `api/config/database.js` is working
- Check `/data` folder exists
- Verify products are in database

### Cart not persisting
- Check browser localStorage is enabled
- Ensure user is logged in
- Verify cart data in browser DevTools

## 📞 Support

For issues or questions:
1. Check the API endpoints
2. Review the code comments
3. Check browser console for errors
4. Verify user authentication

## 📄 License

Built for educational purposes. Free to use and modify.

## 🎯 Future Enhancements

- [ ] Real payment gateway integration (Paystack, Flutterwave)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Wishlist feature
- [ ] Product recommendations
- [ ] Live chat support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

---

**Happy Selling! 🐟**
