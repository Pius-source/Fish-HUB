// Cart Page Handler
document.addEventListener('DOMContentLoaded', async function() {
  const cartContainer = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Redirect if not logged in
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.getUser();
  cartManager = new CartManager(user.id);

  function renderCart() {
    const cart = cartManager.getCart();

    if (cart.items.length === 0) {
      cartContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>';
      cartSummary.innerHTML = `
        <div class="summary-item">
          <span>Total:</span>
          <span>₵0.00</span>
        </div>
      `;
      checkoutBtn.disabled = true;
      return;
    }

    cartContainer.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <div class="item-image">${item.image}</div>
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>Price: ₵${item.price.toLocaleString()}</p>
          <div class="item-quantity">
            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <input type="number" value="${item.quantity}" readonly />
            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="item-total">
          <p>₵${(item.price * item.quantity).toLocaleString()}</p>
          <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    cartSummary.innerHTML = `
      <div class="summary-item">
        <span>Subtotal (${cart.items.length} items):</span>
        <span>₵${cart.total.toLocaleString()}</span>
      </div>
      <div class="summary-item">
        <span>Shipping:</span>
        <span>₵5.00</span>
      </div>
      <div class="summary-item" style="border-top: 1px solid #ddd; margin-top: 1rem; padding-top: 1rem;">
        <span><strong>Total:</strong></span>
        <span><strong>₵${(cart.total + 5).toLocaleString()}</strong></span>
      </div>
    `;

    checkoutBtn.disabled = false;
  }

  window.updateQuantity = function(itemId, newQuantity) {
    if (newQuantity > 0) {
      cartManager.updateQuantity(itemId, newQuantity);
      renderCart();
      updateCartBadge();
    }
  };

  window.removeItem = function(itemId) {
    if (confirm('Remove item from cart?')) {
      cartManager.removeItem(itemId);
      renderCart();
      updateCartBadge();
    }
  };

  checkoutBtn.addEventListener('click', function() {
    window.location.href = 'checkout.html';
  });

  renderCart();
});
