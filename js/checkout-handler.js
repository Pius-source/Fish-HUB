// Checkout Handler
document.addEventListener('DOMContentLoaded', async function() {
  // Redirect if not logged in
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const user = auth.getUser();
  const cartManager = new CartManager(user.id);
  const orderMgr = new OrderManager(auth.getToken());

  const orderSummary = document.getElementById('orderSummary');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  
  // Payment UI Elements
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const momoDetails = document.getElementById('momoDetails');
  const cardDetails = document.getElementById('cardDetails');
  const bankDetails = document.getElementById('bankDetails');

  // Handle Payment Method Switching
  function togglePaymentDetails(method) {
    // Hide all first
    momoDetails.style.display = 'none';
    cardDetails.style.display = 'none';
    bankDetails.style.display = 'none';

    // Show selected
    if (method === 'momo') momoDetails.style.display = 'block';
    if (method === 'visa') cardDetails.style.display = 'block';
    if (method === 'bank') bankDetails.style.display = 'block';
    
    // Update visual selection
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    const selectedRadio = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
    if (selectedRadio) {
        selectedRadio.closest('.payment-option').classList.add('selected');
    }
  }

  paymentMethods.forEach(radio => {
    radio.addEventListener('change', (e) => togglePaymentDetails(e.target.value));
  });

  // Initial render
  renderOrderSummary();
  // Set initial payment state
  togglePaymentDetails('momo');

  function renderOrderSummary() {
    const cart = cartManager.getCart();

    if (cart.items.length === 0) {
      orderSummary.innerHTML = '<p>No items in cart. Redirecting...</p>';
      setTimeout(() => window.location.href = 'cart.html', 2000);
      return;
    }

    // Calculate total
    const shipping = 5; // Cedi
    const total = cart.total + shipping;

    orderSummary.innerHTML = `
      <div class="summary-title">Order Summary</div>
      <div class="order-items">
        ${cart.items.map(item => `
          <div class="summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₵${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">
        <div class="summary-row"><span>Subtotal:</span> <span>₵${cart.total.toLocaleString()}</span></div>
        <div class="summary-row"><span>Delivery Fee:</span> <span>₵${shipping.toFixed(2)}</span></div>
        <div class="summary-row total" style="border-top: 1px solid #ddd; padding-top: 0.5rem; margin-top: 0.5rem;">
          <span><strong>Total:</strong></span> <span><strong>₵${total.toLocaleString()}</strong></span>
        </div>
      </div>
      <button id="placeOrderBtn" class="place-order-btn" type="button">Pay & Complete Order</button>
    `;
    
    // Update dynamic total in payment notes
    document.querySelectorAll('.dynamic-total').forEach(el => {
        el.textContent = `₵${total.toLocaleString()}`;
    });

    // Re-attach listener since we overwrote the button
    document.getElementById('placeOrderBtn').addEventListener('click', handlePlaceOrder);
  }

  async function handlePlaceOrder() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'momo';

    // Basic Validation
    if (!address || !phone) {
      alert('Please fill in all delivery details (Address and Phone)');
      return;
    }

    // Payment Validation & Simulation
    if (paymentMethod === 'momo') {
        const momoNumber = document.getElementById('momoNumber').value.trim();
        if (!momoNumber || momoNumber.length < 10) {
            alert('Please enter a valid Mobile Money number');
            return;
        }

        // SIMULATE USSD PUSH
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Awaiting Confirmation...';
        
        // Short delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Prompt user for PIN (Simulating the phone prompt)
        const pin = prompt(`USSD Message:\nPayment of ₵${(cart.total + 5).toLocaleString()} to Fish Hub.\n\nPlease enter your MM PIN to confirm:`);
        
        if (!pin || pin.length < 4) {
            alert('Payment Cancelled: Invalid PIN or User Cancelled.');
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Pay & Complete Order';
            return;
        }
    } else if (paymentMethod === 'visa') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const cardExpiry = document.getElementById('cardExpiry').value.trim();
        const cardCvv = document.getElementById('cardCvv').value.trim();
        
        if (!cardNumber || cardNumber.length < 12) {
            alert('Please enter a valid Card Number');
            return;
        }
        if (!cardExpiry) {
            alert('Please enter Card Expiry');
            return;
        }
        if (!cardCvv || cardCvv.length < 3) {
            alert('Please enter CVV');
            return;
        }
    }

    const deliveryAddress = address;
    const cart = cartManager.getCart();

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing Payment...';

    try {
        // Simulate Payment Processing Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await orderMgr.createOrder(
          user.id,
          deliveryAddress,
          paymentMethod,
          cart.items
        );

        if (result.error) {
          // Handle Session Expiry specifically
          if (result.error === 'Invalid token' || result.error === 'No token provided' || result.error.includes('jwt')) {
              alert('Your session has expired. Please login again to continue.');
              auth.logout();
              window.location.href = 'login.html';
              return;
          }
          throw new Error(result.error);
        }

        // Store order details
        localStorage.setItem('lastOrder', JSON.stringify(result.order));

        // Clear Cart
        cartManager.clear();

        // Show success and redirect
        alert(`Payment of ₵${(cart.total + 5).toLocaleString()} Successful! \n\nAmount has been deducted from your account.\n\nOrder placed successfully! Order ID: ${result.order.id}\n\nA confirmation email has been sent to your email address.`);
        window.location.href = 'index.html';

    } catch (error) {
        alert('Error processing order: ' + error.message);
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Pay & Complete Order';
    }
  }
});
