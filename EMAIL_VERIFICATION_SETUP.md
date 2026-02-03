<<<<<<< HEAD
# Email Verification Setup Guide

## Overview
Email verification has been added to the registration system. Users must verify their email before they can login.

## How It Works

1. **User registers** → Account created with status `pending_verification`
2. **Verification email sent** → Contains a verification code and link
3. **User clicks link or enters code** → Email is verified
4. **User can now login** → Full access to the platform

## Configuration

### Option 1: Gmail (Easy Setup)

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Follow the steps

2. **Create App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Google generates a 16-character password
   - Copy this password

3. **Set Environment Variables**:
   - Create a `.env` file in the project root:
     ```
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-16-char-app-password
     ```

### Option 2: Other Email Services

Update `api/config/email.js` with your service details:

```javascript
const transporter = nodemailer.createTransport({
  service: 'your-service',  // or use host/port
  auth: {
    user: 'your-email@example.com',
    pass: 'your-password'
  }
});
```

## Environment Variables

Add to your `.env` file or set in your hosting platform:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=production
PORT=5000
```

## Testing Email Verification

1. **Register a new account** with a real email address
2. **Check your email inbox** for the verification email
3. **Click the verification link** or copy the code
4. **Account is verified** and ready to login

### Test Without Real Email

For local testing, you can comment out the `await sendVerificationEmail()` and `await sendWelcomeEmail()` calls in `api/routes/auth.js` to skip email sending.

Or check server logs to see the verification code printed.

## API Endpoints

### Register
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "1234567890",
  "role": "buyer" // or "seller"
}
Response: User created, verification email sent
```

### Verify Email
```
GET /api/auth/verify?code=ABC123
Response: Redirects to login.html with verified=true
```

### Resend Verification Email
```
POST /api/auth/resend-verification
Body: {
  "email": "user@example.com"
}
Response: New verification email sent
```

### Login (Now Requires Verified Email)
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: JWT token (only if email verified)
```

## Database Changes

New fields added to users:
- `emailVerified`: boolean (default: false)
- `status`: "pending_verification" | "active" | "inactive"

New file created:
- `data/verification_tokens.json` - Stores verification codes with expiration

## Troubleshooting

### Email Not Sending
- Check Gmail App Password is correct
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Check server logs for error messages
- Gmail may block first-time login from new location

### User Can't Login
- Verify email first by clicking link in email
- Check `emailVerified` field in `data/users.json`
- Verification code expires in 24 hours

### Verification Link Not Working
- Check code hasn't expired (24 hour limit)
- Code is case-sensitive
- Try resending verification email for new code

## Next Steps

1. Install dependencies: `npm install`
2. Add `.env` file with email credentials
3. Restart server: `npm start`
4. Test with a real email address
=======
# Email Verification Setup Guide

## Overview
Email verification has been added to the registration system. Users must verify their email before they can login.

## How It Works

1. **User registers** → Account created with status `pending_verification`
2. **Verification email sent** → Contains a verification code and link
3. **User clicks link or enters code** → Email is verified
4. **User can now login** → Full access to the platform

## Configuration

### Option 1: Gmail (Easy Setup)

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Follow the steps

2. **Create App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Google generates a 16-character password
   - Copy this password

3. **Set Environment Variables**:
   - Create a `.env` file in the project root:
     ```
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-16-char-app-password
     ```

### Option 2: Other Email Services

Update `api/config/email.js` with your service details:

```javascript
const transporter = nodemailer.createTransport({
  service: 'your-service',  // or use host/port
  auth: {
    user: 'your-email@example.com',
    pass: 'your-password'
  }
});
```

## Environment Variables

Add to your `.env` file or set in your hosting platform:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=production
PORT=5000
```

## Testing Email Verification

1. **Register a new account** with a real email address
2. **Check your email inbox** for the verification email
3. **Click the verification link** or copy the code
4. **Account is verified** and ready to login

### Test Without Real Email

For local testing, you can comment out the `await sendVerificationEmail()` and `await sendWelcomeEmail()` calls in `api/routes/auth.js` to skip email sending.

Or check server logs to see the verification code printed.

## API Endpoints

### Register
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "1234567890",
  "role": "buyer" // or "seller"
}
Response: User created, verification email sent
```

### Verify Email
```
GET /api/auth/verify?code=ABC123
Response: Redirects to login.html with verified=true
```

### Resend Verification Email
```
POST /api/auth/resend-verification
Body: {
  "email": "user@example.com"
}
Response: New verification email sent
```

### Login (Now Requires Verified Email)
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: JWT token (only if email verified)
```

## Database Changes

New fields added to users:
- `emailVerified`: boolean (default: false)
- `status`: "pending_verification" | "active" | "inactive"

New file created:
- `data/verification_tokens.json` - Stores verification codes with expiration

## Troubleshooting

### Email Not Sending
- Check Gmail App Password is correct
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Check server logs for error messages
- Gmail may block first-time login from new location

### User Can't Login
- Verify email first by clicking link in email
- Check `emailVerified` field in `data/users.json`
- Verification code expires in 24 hours

### Verification Link Not Working
- Check code hasn't expired (24 hour limit)
- Code is case-sensitive
- Try resending verification email for new code

## Next Steps

1. Install dependencies: `npm install`
2. Add `.env` file with email credentials
3. Restart server: `npm start`
4. Test with a real email address
>>>>>>> d95fc8aba83c39b73c2ce34485280b4798a34bfa
