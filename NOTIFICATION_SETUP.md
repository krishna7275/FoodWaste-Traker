# 📧🔔 Notification Setup Guide

This guide explains how to set up Email and WhatsApp notifications for the FoodWaste Tracker application.

## 📧 Email Notifications Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable App Password in Gmail:**
   - Go to your Google Account settings
   - Security → 2-Step Verification (enable if not already)
   - App passwords → Generate new app password
   - Copy the generated password

2. **Add to `.env` file:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### Option 2: Custom SMTP Server

Add to `.env` file:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
```

## 📱 WhatsApp Notifications Setup

### Using Twilio WhatsApp API

1. **Create a Twilio Account:**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get your Account SID and Auth Token from the dashboard

2. **Set up WhatsApp Sandbox (for testing):**
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join the sandbox
   - Get your WhatsApp number (format: `whatsapp:+14155238886`)

3. **Add to `.env` file:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
DEFAULT_COUNTRY_CODE=1
```

### Production Setup (WhatsApp Business API)

For production, you'll need:
- Twilio WhatsApp Business API access
- Verified business account
- Approved WhatsApp Business Profile

## 🔧 Environment Variables

Add these to your `.env` file in the project root:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OR Custom SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-password

# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
DEFAULT_COUNTRY_CODE=1

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## 📝 User Setup

### In the Application:

1. **Go to Settings → Notifications**
2. **Enable Email Notifications:**
   - Toggle "Email Notifications" ON
   - Click "Test" to verify it works

3. **Enable WhatsApp Notifications:**
   - Toggle "WhatsApp Notifications" ON
   - Enter your phone number with country code (e.g., +1234567890)
   - Click "Test WhatsApp" to verify it works

4. **Configure Reminder Days:**
   - Select when you want to be notified (1, 3, 7, or 14 days before expiry)
   - Click "Save Preferences"

## 🎯 How It Works

1. **Daily Cron Job:**
   - Runs every day at 8:00 AM
   - Checks all items for expiry dates
   - Creates alerts for items expiring on configured days

2. **Notification Sending:**
   - For each alert, sends email (if enabled)
   - Sends WhatsApp message (if enabled and phone number provided)
   - Tracks sent status in database

3. **Alert Types:**
   - **Expiring Soon:** Items expiring in 1-14 days
   - **Expires Today:** Items expiring today
   - **Expired:** Items that have already expired

## 🧪 Testing

### Test Email:
1. Go to Settings → Notifications
2. Enable Email Notifications
3. Click "Test" button
4. Check your email inbox

### Test WhatsApp:
1. Go to Settings → Notifications
2. Enable WhatsApp Notifications
3. Enter your phone number
4. Click "Test WhatsApp" button
5. Check your WhatsApp messages

## ⚠️ Important Notes

1. **Gmail App Passwords:**
   - Regular Gmail passwords won't work
   - You MUST use an App Password
   - Enable 2-Step Verification first

2. **Twilio Sandbox:**
   - Free tier allows testing with sandbox
   - Join sandbox by sending code to Twilio number
   - Production requires paid Twilio account

3. **Phone Number Format:**
   - Must include country code
   - Format: +[country code][number]
   - Examples: +1234567890, +919876543210

4. **Rate Limits:**
   - Email: Depends on your provider
   - WhatsApp: Twilio has rate limits on free tier

## 🚀 Production Considerations

1. **Email:**
   - Use professional email service (SendGrid, Mailgun, etc.)
   - Set up SPF/DKIM records
   - Monitor bounce rates

2. **WhatsApp:**
   - Upgrade to Twilio WhatsApp Business API
   - Get business verification
   - Set up proper templates

3. **Error Handling:**
   - Log all notification failures
   - Set up retry mechanisms
   - Monitor notification delivery rates

## 📊 Notification Content

### Email Includes:
- Item name and details
- Expiry date
- Quantity and category
- Link to dashboard
- Beautiful HTML template

### WhatsApp Includes:
- Item name
- Days until expiry
- Expiry date
- Quantity
- Link to dashboard

## 🔒 Security

- Never commit `.env` file to git
- Use environment variables for all credentials
- Rotate passwords regularly
- Use App Passwords instead of main passwords

## 🆘 Troubleshooting

### Email not sending:
- Check email credentials in `.env`
- Verify App Password is correct (Gmail)
- Check SMTP settings
- Check spam folder

### WhatsApp not sending:
- Verify Twilio credentials
- Check phone number format
- Ensure sandbox is joined (for testing)
- Check Twilio console for errors

### Notifications not working:
- Check if notifications are enabled in user preferences
- Verify cron job is running
- Check server logs for errors
- Ensure database connection is working

---

**Need Help?** Check the server logs for detailed error messages!

