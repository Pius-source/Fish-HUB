<<<<<<< HEAD
# Email Verification - Quick Start

## What Changed?

When users register, they must verify their email before logging in.

## Setup (5 minutes)

### 1. Create `.env` file in project root:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### 2. Get Gmail App Password:
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Select "Mail" and "Windows Computer"
- Copy the 16-character password Gmail generates
- Paste into `.env` as EMAIL_PASSWORD

### 3. Restart server:
```
npm start
```

## User Flow

1. **User registers** with email `john@example.com`
2. **Verification email sent** to john@example.com
3. **User clicks link** in email
4. **Email verified** ✅
5. **User can login** normally

## Testing

### With Real Email:
1. Register at [localhost:5000/register.html](http://localhost:5000/register.html)
2. Check your email for verification link
3. Click link
4. Login with same email

### Without Email Setup (Development):
- Comment out email sending in `api/routes/auth.js` lines 58-59
- Check server console for verification code
- Manually verify by visiting: `http://localhost:5000/api/auth/verify?code=XXXXXX`

## Key Files

- **API**: [api/routes/auth.js](api/routes/auth.js) - Verification logic
- **Email Config**: [api/config/email.js](api/config/email.js) - Email settings
- **Database**: [api/config/database.js](api/config/database.js) - Token storage
- **Full Guide**: [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)

## Existing Users

All existing users have `emailVerified: true`, so they can login immediately without verification.

## Features

✅ Verification code expires in 24 hours  
✅ Resend verification email anytime  
✅ Email case-insensitive (john@example.com = JOHN@EXAMPLE.COM)  
✅ Sellers auto-verified after email confirmation  
✅ HTML email templates  

## Common Issues

**"Email not sending"**
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Gmail may block first login from new location (check email for Google security alert)

**"User can't login"**
- Make sure email is verified (click link in verification email)
- Check for typos in email address

**"Link doesn't work"**
- Code expires after 24 hours
- Try resending verification email via `/api/auth/resend-verification`
=======
# Email Verification - Quick Start

## What Changed?

When users register, they must verify their email before logging in.

## Setup (5 minutes)

### 1. Create `.env` file in project root:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### 2. Get Gmail App Password:
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Select "Mail" and "Windows Computer"
- Copy the 16-character password Gmail generates
- Paste into `.env` as EMAIL_PASSWORD

### 3. Restart server:
```
npm start
```

## User Flow

1. **User registers** with email `john@example.com`
2. **Verification email sent** to john@example.com
3. **User clicks link** in email
4. **Email verified** ✅
5. **User can login** normally

## Testing

### With Real Email:
1. Register at [localhost:5000/register.html](http://localhost:5000/register.html)
2. Check your email for verification link
3. Click link
4. Login with same email

### Without Email Setup (Development):
- Comment out email sending in `api/routes/auth.js` lines 58-59
- Check server console for verification code
- Manually verify by visiting: `http://localhost:5000/api/auth/verify?code=XXXXXX`

## Key Files

- **API**: [api/routes/auth.js](api/routes/auth.js) - Verification logic
- **Email Config**: [api/config/email.js](api/config/email.js) - Email settings
- **Database**: [api/config/database.js](api/config/database.js) - Token storage
- **Full Guide**: [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)

## Existing Users

All existing users have `emailVerified: true`, so they can login immediately without verification.

## Features

✅ Verification code expires in 24 hours  
✅ Resend verification email anytime  
✅ Email case-insensitive (john@example.com = JOHN@EXAMPLE.COM)  
✅ Sellers auto-verified after email confirmation  
✅ HTML email templates  

## Common Issues

**"Email not sending"**
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Gmail may block first login from new location (check email for Google security alert)

**"User can't login"**
- Make sure email is verified (click link in verification email)
- Check for typos in email address

**"Link doesn't work"**
- Code expires after 24 hours
- Try resending verification email via `/api/auth/resend-verification`
>>>>>>> d95fc8aba83c39b73c2ce34485280b4798a34bfa
