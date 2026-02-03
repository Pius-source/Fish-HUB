// Login Form Handler
console.log('🔐 Login handler script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔐 DOM loaded, initializing login form...');
  
  const form = document.getElementById('loginForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const nameField = document.getElementById('nameField');
  const phoneField = document.getElementById('phoneField');
  const roleField = document.getElementById('roleField');
  const toggleText = document.getElementById('toggleText');
  const errorMsg = document.getElementById('errorMsg');

  // Check if auth manager exists
  if (typeof auth === 'undefined') {
    console.error('❌ AuthManager not found! api-client.js not loaded properly');
  } else {
    console.log('✅ AuthManager loaded successfully');
  }

  let isLoginMode = true;

  // Toggle between Login and Register
  function attachToggleListener() {
    const toggleLink = document.getElementById('toggleLink');
    console.log('🔄 Attaching toggle listener, element found:', !!toggleLink);
    
    if (toggleLink) {
      toggleLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔄 Toggle clicked! Switching mode...');
        isLoginMode = !isLoginMode;

        if (isLoginMode) {
          console.log('🔄 Switched to LOGIN mode');
          formTitle.textContent = 'Login to Fish Hub';
          submitBtn.textContent = 'Login';
          nameField.style.display = 'none';
          phoneField.style.display = 'none';
          roleField.style.display = 'none';
          toggleText.innerHTML = "Don't have an account? <a href='#' id='toggleLink'>Register</a>";
        } else {
          console.log('🔄 Switched to REGISTER mode');
          formTitle.textContent = 'Create Fish Hub Account';
          submitBtn.textContent = 'Register';
          nameField.style.display = 'block';
          phoneField.style.display = 'block';
          roleField.style.display = 'block';
          toggleText.innerHTML = "Already have an account? <a href='#' id='toggleLink'>Login</a>";
        }

        // Re-attach toggle event listener
        attachToggleListener();
      });
    }
  }

  // Attach initial toggle listener
  console.log('🔄 Initializing toggle listener...');
  attachToggleListener();

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📝 Form submitted, mode:', isLoginMode ? 'LOGIN' : 'REGISTER');

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    console.log('📧 Email:', email.substring(0, 5) + '...');
    console.log('🔑 Password:', password.length + ' chars');

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    try {
      let result;

      if (isLoginMode) {
        console.log('🔐 Calling auth.login()...');
        result = await auth.login(email, password);
        console.log('🔐 Login result:', result);
      } else {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const role = document.getElementById('role').value;

        if (!name) {
          showError('Name is required');
          return;
        }

        if (password.length < 6) {
          showError('Password must be at least 6 characters');
          return;
        }

        console.log('📋 Calling auth.register()...');
        console.log('   Name:', name);
        console.log('   Email:', email);
        console.log('   Phone:', phone);
        console.log('   Role:', role);
        console.log('   Password length:', password.length);
        
        result = await auth.register(email, password, name, phone, role);
        console.log('📋 Register result:', result);
      }

      if (result && result.success) {
        console.log('✅ Auth successful! Redirecting to home page...');
        // Redirect to home page
        window.location.href = 'index.html';
      } else if (result && result.error) {
        console.error('❌ Auth failed:', result.error);
        if (typeof result.error === 'string' && (result.error.includes('Server returned') || result.error.includes('Invalid JSON') || result.error.includes('did not return'))) {
          showError('Server error: API may be down or returning HTML instead of JSON. Check backend and API URL.');
        } else {
          showError(result.error);
        }
      } else {
        console.error('❌ Unexpected result:', result);
        showError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Exception during auth:', err);
      console.error('Error details:', err.message, err.stack);
      showError('An error occurred: ' + err.message);
    }
  });

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 5000);
  }
});
