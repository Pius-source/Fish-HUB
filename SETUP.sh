#!/bin/bash
# Fish Hub Ecommerce Platform - Setup Guide

echo "🐟 Fish Hub - E-commerce Marketplace Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "Then open your browser and visit:"
echo "  http://localhost:5000"
echo ""
echo "Features:"
echo "  🔐 User Authentication (Register/Login)"
echo "  🛍️  Shopping Cart & Checkout"
echo "  📦 Order Management & Tracking"
echo "  ⭐ Product Reviews & Ratings"
echo "  👨‍💼 Seller Dashboard"
echo "  🔍 Product Search & Filtering"
echo "  💳 Payment Processing"
echo ""
