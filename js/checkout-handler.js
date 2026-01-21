// Checkout Handler
document.addEventListener('DOMContentLoaded', async function() {
  // Redirect if not logged in
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.getUser();
  cartManager = new CartManager(user.id);
  const orderMgr = new OrderManager(auth.getToken());

  const orderSummary = document.getElementById('orderSummary');
  const deliveryForm = document.getElementById('deliveryForm');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  function renderOrderSummary() {
    const cart = cartManager.getCart();

    if (cart.items.length === 0) {
      orderSummary.innerHTML = '<p>No items in cart. Redirecting...</p>';
      setTimeout(() => window.location.href = 'cart.html', 2000);
      return;
    }

    orderSummary.innerHTML = `
      <div class="order-items">
        ${cart.items.map(item => `
          <div class="order-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₦${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">
        <div><span>Subtotal:</span> <span>₦${cart.total.toLocaleString()}</span></div>
        <div><span>Shipping:</span> <span>₦500</span></div>
        <div style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem;">
          <span><strong>Total:</strong></span> <span><strong>₦${(cart.total + 500).toLocaleString()}</strong></span>
        </div>
      </div>
    `;
  }

  placeOrderBtn.addEventListener('click', async function() {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!address || !city || !phone) {
      alert('Please fill in all delivery details');
      return;
    }

    const deliveryAddress = `${address}, ${city}`;
    const cart = cartManager.getCart();

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing...';

    const result = await orderMgr.createOrder(
      user.id,
      deliveryAddress,
      paymentMethod,
      cart.items
    );

    if (result.error) {
      alert('Error placing order: ' + result.error);
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
      return;
    }

    // Store order details
    localStorage.setItem('lastOrder', JSON.stringify(result.order));

    // Show success and redirect
    alert('Order placed successfully! Order ID: ' + result.order.id);
    window.location.href = 'index.html';
  });

  renderOrderSummary();
});
