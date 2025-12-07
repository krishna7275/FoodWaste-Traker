# 🔗 Notification API Reference & Examples

## Base URL
```
http://localhost:5000/api/notifications
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1️⃣ Get Notification Preferences

### Request
```http
GET /api/notifications/preferences
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)
```json
{
  "email": "user@gmail.com",
  "phoneNumber": "+919876543210",
  "preferences": {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "whatsappNotifications": true,
    "reminderDays": [7, 3, 1]
  }
}
```

### cURL Example
```bash
curl -X GET http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Axios Example
```javascript
import axios from 'axios';

const token = localStorage.getItem('token');

const getPreferences = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/notifications/preferences',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Preferences:', response.data.preferences);
  } catch (error) {
    console.error('Error:', error.response?.data?.error);
  }
};
```

---

## 2️⃣ Update Notification Preferences

### Request
```http
PUT /api/notifications/preferences
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "emailNotifications": true,
  "whatsappNotifications": false,
  "reminderDays": [7, 3, 1]
}
```

### Response (200 OK)
```json
{
  "message": "Notification preferences updated successfully",
  "preferences": {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "whatsappNotifications": false,
    "reminderDays": [7, 3, 1],
    "phoneNumber": "+919876543210"
  }
}
```

### cURL Example
```bash
curl -X PUT http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "emailNotifications": true,
    "whatsappNotifications": false,
    "reminderDays": [7, 3, 1]
  }'
```

### JavaScript/Axios Example
```javascript
const updatePreferences = async (preferences) => {
  try {
    const response = await axios.put(
      'http://localhost:5000/api/notifications/preferences',
      {
        phoneNumber: preferences.phoneNumber,
        emailNotifications: preferences.emailNotifications,
        whatsappNotifications: preferences.whatsappNotifications,
        reminderDays: preferences.reminderDays
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Updated:', response.data.message);
  } catch (error) {
    console.error('Error:', error.response?.data?.error);
  }
};

// Usage
updatePreferences({
  phoneNumber: '+919876543210',
  emailNotifications: true,
  whatsappNotifications: true,
  reminderDays: [7, 3, 1]
});
```

---

## 3️⃣ Send Test Email

### Request
```http
POST /api/notifications/test/email
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "message": "Test email sent successfully! Check your inbox."
}
```

### Response (400 Bad Request)
```json
{
  "error": "Email notifications are disabled"
}
```

### Response (500 Server Error)
```json
{
  "error": "Failed to send test email. Check server logs."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/notifications/test/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Axios Example
```javascript
const sendTestEmail = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/notifications/test/email',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Email sent! Check your inbox.');
    alert(response.data.message);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error);
    alert('Failed to send test email: ' + error.response?.data?.error);
  }
};
```

### React Component Example
```jsx
import { useState } from 'react';
import axios from 'axios';
import { useToast } from './components/ui/Toast';

const NotificationTester = () => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const token = localStorage.getItem('token');

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/notifications/test/email',
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      addToast('Test email sent! Check your inbox.', 'success');
    } catch (error) {
      addToast(
        error.response?.data?.error || 'Failed to send email',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleTestEmail} disabled={loading}>
      {loading ? 'Sending...' : 'Test Email'}
    </button>
  );
};
```

---

## 4️⃣ Send Test WhatsApp

### Request
```http
POST /api/notifications/test/whatsapp
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "message": "Test WhatsApp sent successfully! Check your messages."
}
```

### Response (400 Bad Request)
```json
{
  "error": "Phone number not set"
}
```

### Response (500 Server Error)
```json
{
  "error": "Failed to send test WhatsApp. Check server logs."
}
```

### cURL Example
```bash
curl -X POST http://localhost:5000/api/notifications/test/whatsapp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Axios Example
```javascript
const sendTestWhatsApp = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/notifications/test/whatsapp',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ WhatsApp sent! Check your phone.');
    alert(response.data.message);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error);
    alert('Failed to send test WhatsApp: ' + error.response?.data?.error);
  }
};
```

---

## Error Handling Guide

### Common Errors & Solutions

#### 401 Unauthorized
```json
{
  "error": "No authentication token, access denied"
}
```
**Solution**: Add JWT token to Authorization header
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

#### 400 Bad Request
```json
{
  "error": "Phone number not configured"
}
```
**Solution**: Update preferences with phone number first
```javascript
// First: Set phone number
await updatePreferences({
  phoneNumber: '+919876543210',
  whatsappNotifications: true
});

// Then: Send test WhatsApp
await sendTestWhatsApp();
```

#### 500 Server Error
```json
{
  "error": "Failed to send test email. Check server logs."
}
```
**Solution**: 
1. Check .env file has EMAIL_USER and EMAIL_PASSWORD
2. Check Gmail App Password is correct (16 chars)
3. Check backend logs for detailed error message
4. Verify internet connection

---

## Complete Flow Example

```javascript
// 1. Login and get JWT token
const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
  email: 'user@gmail.com',
  password: 'password123'
});
const token = loginResponse.data.token;

// 2. Get current preferences
const prefsResponse = await axios.get(
  'http://localhost:5000/api/notifications/preferences',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
console.log('Current settings:', prefsResponse.data.preferences);

// 3. Update preferences
const updateResponse = await axios.put(
  'http://localhost:5000/api/notifications/preferences',
  {
    phoneNumber: '+919876543210',
    emailNotifications: true,
    whatsappNotifications: true,
    reminderDays: [7, 3, 1]
  },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
console.log('Updated settings:', updateResponse.data.preferences);

// 4. Send test email
const emailResponse = await axios.post(
  'http://localhost:5000/api/notifications/test/email',
  {},
  { headers: { 'Authorization': `Bearer ${token}` } }
);
console.log('Email result:', emailResponse.data.message);

// 5. Send test WhatsApp
const whatsappResponse = await axios.post(
  'http://localhost:5000/api/notifications/test/whatsapp',
  {},
  { headers: { 'Authorization': `Bearer ${token}` } }
);
console.log('WhatsApp result:', whatsappResponse.data.message);
```

---

## Backend Integration Example

```javascript
// In your backend route handler
import axios from 'axios';

router.post('/send-expiry-notification', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Get user preferences
    const prefsResponse = await axios.get(
      'http://localhost:5000/api/notifications/preferences',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const prefs = prefsResponse.data.preferences;

    // Send email if enabled
    if (prefs.emailNotifications) {
      await axios.post(
        'http://localhost:5000/api/notifications/test/email',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    }

    // Send WhatsApp if enabled and phone is set
    if (prefs.whatsappNotifications && req.user.phoneNumber) {
      await axios.post(
        'http://localhost:5000/api/notifications/test/whatsapp',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    }

    res.json({ message: 'Notifications sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Rate Limiting Recommendations

For production, add rate limiting to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

// Limit test endpoints to 5 requests per minute per user
const testLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 5,                    // 5 requests
  message: 'Too many test requests, please try again later',
  standardHeaders: true,     // Include info in RateLimit-* headers
  legacyHeaders: false,      // Disable X-RateLimit-* headers
});

router.post('/test/email', testLimiter, auth, ...);
router.post('/test/whatsapp', testLimiter, auth, ...);

// Limit preference updates to 10 per hour
const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10
});

router.put('/preferences', updateLimiter, auth, ...);
```

---

## WebSocket Implementation (Advanced)

For real-time notification delivery status:

```javascript
// Backend
import { Server } from 'socket.io';

const io = new Server(app);

io.on('connection', (socket) => {
  socket.on('test-email', async (data) => {
    try {
      const result = await sendEmailNotification(...);
      socket.emit('test-email-result', {
        success: true,
        message: 'Email sent successfully'
      });
    } catch (error) {
      socket.emit('test-email-result', {
        success: false,
        error: error.message
      });
    }
  });
});

// Frontend
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.emit('test-email', {});
socket.on('test-email-result', (data) => {
  if (data.success) {
    alert('Email sent!');
  } else {
    alert('Error: ' + data.error);
  }
});
```

---

## Webhook Integration (Advanced)

For Twilio WhatsApp delivery status:

```javascript
// Receive delivery status from Twilio
app.post('/webhooks/twilio/status', (req, res) => {
  const { MessageSid, MessageStatus } = req.body;
  
  console.log(`Message ${MessageSid} status: ${MessageStatus}`);
  
  // Update notification record
  if (MessageStatus === 'delivered') {
    // Update database
    await Alert.updateOne(
      { twilioSid: MessageSid },
      { whatsappDelivered: true }
    );
  }
  
  res.sendStatus(200);
});
```

---

## Testing with Postman

### Set Up Postman Collection

1. Create new collection: "Food Waste Tracker"
2. Create requests:
   - **Get Preferences** - GET /api/notifications/preferences
   - **Update Preferences** - PUT /api/notifications/preferences
   - **Test Email** - POST /api/notifications/test/email
   - **Test WhatsApp** - POST /api/notifications/test/whatsapp

3. Set environment variable:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

4. In each request header:
   ```
   Authorization: Bearer {{token}}
   ```

---

## Performance Optimization

### Caching Preferences
```javascript
// Cache user preferences for 5 minutes
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

router.get('/preferences', auth, async (req, res) => {
  const cacheKey = `prefs_${req.user.id}`;
  
  // Check cache first
  let prefs = cache.get(cacheKey);
  if (prefs) {
    return res.json(prefs);
  }
  
  // Fetch from database if not cached
  const user = await User.findById(req.user.id);
  prefs = { ... };
  
  // Store in cache
  cache.set(cacheKey, prefs);
  
  res.json(prefs);
});
```

### Batch Notifications
```javascript
// Send notifications in batches instead of one-by-one
async function sendBatchNotifications(userIds, itemDetails) {
  const batchSize = 100;
  
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(userId => 
        sendNotification(userId, itemDetails)
      )
    );
    
    // Add delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

**Happy Testing!** 🎉
