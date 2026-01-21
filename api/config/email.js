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

module.exports = {
  transporter,
  sendVerificationEmail,
  sendWelcomeEmail
};
