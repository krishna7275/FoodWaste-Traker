# Email & WhatsApp Notification Setup Guide

## Overview
This guide will help you set up email and WhatsApp notifications for the Food Waste Tracker application. When food items are about to expire, users will receive notifications via their preferred channel.

## Implementation Status
✅ **Backend**:
- Notification service module created (`notificationService.js`)
- Notification routes implemented with test endpoints
- Reminder cron job updated to send notifications
- User model supports notification preferences

✅ **Frontend**:
- Settings page with notification preferences UI
- Test buttons for email and WhatsApp
- Phone number input field
- Notification preference toggles

✅ **Dependencies**:
- `nodemailer` (v7.0.11) - for email notifications
- `twilio` (v5.10.7) - for WhatsApp notifications

---

## Step 1: Gmail Configuration

### Get Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication if not already done
3. Go to **Security** → **App passwords**
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Add to `.env`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### Alternative: Use Custom SMTP
If using a different email provider:
```
EMAIL_SERVICE=custom
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_SECURE=false
```

---

## Step 2: Twilio WhatsApp Setup

### Create Twilio Account
1. Go to https://www.twilio.com/
2. Sign up for a free account (includes $15 credit)
3. Go to **Console** → **Account info**
4. Copy your **Account SID** and **Auth Token**

### Set Up WhatsApp Sandbox
1. Go to **Messaging** → **Messaging Services** → **WhatsApp Sandbox**
2. Join the sandbox by sending the code to the WhatsApp number shown
3. Copy the **Sandbox Number** (starts with `whatsapp:+1...`)
4. Add to `.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### For Production: Migrate to Business Account
- Requires WhatsApp Business verification
- Higher cost but full branding
- Contact Twilio sales for setup

---

## Step 3: Update .env File

Edit `food-expiry-tracker/.env`:
```dotenv
# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Email Configuration (Custom SMTP - alternative)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-password

# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## Step 4: Test Notifications

### Via Frontend Settings Page
1. Start both backend and frontend:
   ```powershell
   # Terminal 1 - Backend
   cd food-expiry-tracker/backend
   npm run dev

   # Terminal 2 - Frontend
   cd food-expiry-tracker/frontend
   npm run dev
   ```

2. Login to the application
3. Go to **Settings** → **Notifications**
4. Enter your phone number (for WhatsApp): `+91XXXXXXXXXX` (with country code)
5. Toggle email/WhatsApp notifications ON
6. Click **"Test Email"** button
7. Check your email inbox for the test message
8. Click **"Test WhatsApp"** button  
9. Check WhatsApp for the test message

### Via API (Using Postman/cURL)
**Test Email:**
```bash
curl -X POST http://localhost:5000/api/notifications/test/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Test WhatsApp:**
```bash
curl -X POST http://localhost:5000/api/notifications/test/whatsapp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Step 5: Automatic Notifications

### Reminder Job Schedule
The system automatically checks for expiring items **daily at 8:00 AM** (server time).

For each expiring item matching user's reminder preferences:
1. Email is sent to user's registered email
2. WhatsApp message is sent to user's phone number (if opted-in)

### Configure Reminder Days
In Settings → Notifications, select which days before expiry to receive alerts:
- **7 days** - Items expiring in a week
- **3 days** - Items expiring soon
- **1 day** - Items expiring tomorrow

Example notification:
- **Email**: Professional HTML template with item details and dashboard link
- **WhatsApp**: Formatted message with item name, category, expiry date, and status

---

## Step 6: Notification Preferences

### User Settings
Navigate to **Settings** → **Notifications**:

| Setting | Default | Description |
|---------|---------|-------------|
| **Email Notifications** | ✅ ON | Receive expiry alerts via email |
| **WhatsApp Notifications** | ❌ OFF | Receive expiry alerts via WhatsApp |
| **Reminder Days** | [7, 3, 1] | Days before expiry to notify user |
| **Phone Number** | Empty | WhatsApp number (format: +919876543210) |

### Backend Endpoint
```javascript
// Get preferences
GET /api/notifications/preferences
Authorization: Bearer JWT_TOKEN

// Update preferences
PUT /api/notifications/preferences
Authorization: Bearer JWT_TOKEN
Body: {
  "notificationsEnabled": true,
  "emailNotifications": true,
  "whatsappNotifications": false,
  "reminderDays": [7, 3, 1],
  "phoneNumber": "+919876543210"
}
```

---

## Troubleshooting

### Email Not Sending
**Problem**: "Failed to send test email"

**Solutions**:
1. Verify Gmail App Password is correct (no spaces in code)
2. Check if 2FA is enabled on Google Account
3. For custom SMTP, verify host, port, and credentials
4. Check server logs: `npm run dev` to see detailed error

**Debug Test**:
```bash
# Check if email config loaded
curl http://localhost:5000/api/health
# Should show: { "status": "ok" }
```

### WhatsApp Not Sending
**Problem**: "Failed to send test WhatsApp"

**Solutions**:
1. Ensure phone number includes country code: `+919876543210` (not `09876543210`)
2. Verify WhatsApp sandbox is active (check Twilio console)
3. Confirm you've joined sandbox by sending join code to sandbox number
4. For sandbox, only pre-approved numbers can receive messages

**Debug Phone Format**:
- India: `+91` prefix
- US: `+1` prefix
- UK: `+44` prefix
- Include leading `+` and no spaces/dashes

### Cron Job Not Running
**Problem**: Notifications aren't sent automatically

**Solutions**:
1. Check that MongoDB is running
2. Verify backend is running with `npm run dev`
3. Server logs will show: "⏰ Reminder cron job scheduled (runs daily at 8:00 AM)"
4. For testing, job runs immediately on startup (5-second delay)

---

## API Reference

### Get Notification Preferences
```
GET /api/notifications/preferences
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "email": "user@example.com",
  "phoneNumber": "+919876543210",
  "preferences": {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "whatsappNotifications": true,
    "reminderDays": [7, 3, 1]
  }
}
```

### Update Notification Preferences
```
PUT /api/notifications/preferences
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "phoneNumber": "+919876543210",
  "emailNotifications": true,
  "whatsappNotifications": false,
  "reminderDays": [7, 3, 1]
}

Response:
{
  "message": "Preferences updated successfully",
  "preferences": { ... }
}
```

### Send Test Email
```
POST /api/notifications/test/email
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "Test email sent successfully! Check your inbox."
}
```

### Send Test WhatsApp
```
POST /api/notifications/test/whatsapp
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "Test WhatsApp sent successfully! Check your messages."
}
```

---

## Security Best Practices

1. **Never commit .env file** to git (already in .gitignore)
2. **Use App Passwords for Gmail** instead of your actual password
3. **Rotate Twilio tokens** regularly
4. **Validate phone numbers** on the backend before storing
5. **Rate limit** notification endpoints to prevent abuse
6. **Encrypt sensitive data** in database (future enhancement)

---

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── notificationService.js      ✅ NEW - Email & WhatsApp logic
│   ├── routes/
│   │   └── notifications.js             ✅ UPDATED - API endpoints
│   ├── jobs/
│   │   └── reminderJob.js              ✅ UPDATED - Uses notification service
│   └── models/
│       └── User.js                     ✅ Already has notification preferences
│
frontend/
└── src/
    ├── pages/
    │   └── Settings.jsx                ✅ UPDATED - UI for notification prefs
    └── services/
        └── api.js                      ✅ Already has notification APIs
```

---

## Next Steps

1. ✅ Install packages: `npm install nodemailer twilio`
2. ✅ Create notification service module
3. ✅ Update routes and cron job
4. 📝 Configure .env with Gmail and Twilio credentials
5. 🧪 Test email and WhatsApp notifications
6. 📊 Monitor notification delivery in database

---

## Support

For issues:
1. Check server logs: `npm run dev` output
2. Verify environment variables are loaded
3. Test individual notification functions
4. Check Twilio/Gmail account status and quotas
5. Refer to NOTIFICATION_SETUP.md for more details

---

**Setup Time**: ~15 minutes (Gmail) + ~10 minutes (Twilio) = ~25 minutes total

Good luck! 🎉
