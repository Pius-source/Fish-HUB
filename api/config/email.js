const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config();

// Email configuration
// For Gmail: Use App Password (not regular password)
// For other services: Update accordingly

let transporter;

// Only initialize transporter if email credentials are configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
    process.env.EMAIL_USER !== 'your-email@gmail.com') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('✅ Email transporter configured');
} else {
  console.log('⚠️ Email not configured. Verification emails will not be sent.');
  console.log('   Set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

// Function to send verification email
async function sendVerificationEmail(userEmail, verificationCode) {
  try {
    // Skip if email not configured
    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping verification email for:', userEmail);
      console.log('   Verification Code:', verificationCode);
      return true; // Return true to allow registration to continue
    }

    const verificationLink = `http://localhost:5000/api/auth/verify?code=${verificationCode}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🐟 Fish Hub - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Fish Hub!</h2>
          <p>Thank you for registering. Please verify your email address to complete your account setup.</p>
          
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </p>
          
          <p><strong>Verification Code:</strong> ${verificationCode}</p>
          
          <p>Or click this link: <a href="${verificationLink}">${verificationLink}</a></p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            This verification link expires in 24 hours.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.response);
    return true;
  } catch (err) {
    console.error('❌ Failed to send verification email:', err.message);
    return false;
  }
}

// Function to send welcome email after verification
async function sendWelcomeEmail(userEmail, userName) {
  try {
    // Skip if email not configured
    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping welcome email for:', userEmail);
      return true; // Return true to allow verification to complete
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🐟 Welcome to Fish Hub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome, ${userName}!</h2>
          <p>Your email has been verified successfully. You can now login and start shopping!</p>
          
          <p>
            <a href="http://localhost:5000/login.html" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Fish Hub
            </a>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', userEmail);
    return true;
  } catch (err) {
    console.error('❌ Failed to send welcome email:', err.message);
    return true; // Still return true to allow user to login
  }
}

// Function to send order confirmation email to buyer
async function sendOrderConfirmationEmail(userEmail, order) {
  try {
    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping order confirmation for:', userEmail);
      return true;
    }

    const itemsList = order.items.map(item => 
      `<div style="padding: 10px; border-bottom: 1px solid #eee;">
         <strong>${item.name}</strong> x ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}
       </div>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🐟 Fish Hub - Order Confirmation #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Order Confirmation</h2>
          <p>Thank you for your order! Here are the details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order #${order.id}</h3>
            <p><strong>Total:</strong> ₦${order.total.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            <div style="border-top: 2px dashed #ccc; margin-top: 15px; padding-top: 15px;">
               <p style="font-size: 1.2em; color: #d35400;"><strong>Your Order Code:</strong> <span style="font-size: 1.5em; letter-spacing: 5px; background: #fff; padding: 5px 10px; border: 1px solid #ddd;">${order.pickupCode || 'N/A'}</span></p>
               <p style="font-size: 0.9em; color: #7f8c8d;">Please show this code upon delivery or pickup.</p>
            </div>
          </div>

          <h3>Items:</h3>
          ${itemsList}
          
          <p style="margin-top: 30px;">
            We will notify you when your order is on its way!
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', userEmail);
    return true;
  } catch (err) {
    console.error('❌ Failed to send order confirmation email:', err.message);
    return false;
  }
}

// Function to send new order notification to seller
async function sendSellerOrderNotification(sellerEmail, sellerName, items, earnings) {
  try {
    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping seller notification for:', sellerEmail);
      return true;
    }

    const itemsList = items.map(item => 
      `<div style="padding: 10px; border-bottom: 1px solid #eee;">
         <strong>${item.name}</strong> x ${item.quantity}
       </div>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: '🐟 Fish Hub - New Order Received!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Order Received!</h2>
          <p>Hello ${sellerName}, you have received a new order.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Earnings: ₦${earnings.toLocaleString()}</h3>
          </div>

          <h3>Items to Prepare:</h3>
          ${itemsList}
          
          <p style="margin-top: 30px;">
            Please login to your dashboard to view full order details and manage shipping.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Seller notification email sent to:', sellerEmail);
    return true;
  } catch (err) {
    console.error('❌ Failed to send seller notification email:', err.message);
    return false;
  }
}

// Function to send login notification email
async function sendLoginNotificationEmail(userEmail, userName, time, ip) {
  try {
    if (!transporter) {
      console.log('⚠️ Email not configured. Skipping login notification for:', userEmail);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🐟 Fish Hub - New Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Login Detected</h2>
          <p>Hello ${userName},</p>
          <p>We detected a new login to your Fish Hub account.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip}</p>
          </div>
          
          <p>If this was you, you can ignore this email.</p>
          <p style="color: red;">If you did not log in, please reset your password immediately.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Login notification email sent to:', userEmail);
    return true;
  } catch (err) {
    console.error('❌ Failed to send login notification email:', err.message);
    return false;
  }
}

module.exports = {
  transporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendSellerOrderNotification,
  sendLoginNotificationEmail
};
