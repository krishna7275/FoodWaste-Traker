import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import {
  testEmail,
  testWhatsApp,
} from '../services/notificationService.js';

const router = express.Router();

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      notificationsEnabled: user.preferences.notificationsEnabled,
      emailNotifications: user.preferences.emailNotifications,
      whatsappNotifications: user.preferences.whatsappNotifications,
      reminderDays: user.preferences.reminderDays,
      phoneNumber: user.phoneNumber || null
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Error fetching notification preferences' });
  }
});

// PUT /api/notifications/preferences - Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { 
      notificationsEnabled, 
      emailNotifications, 
      whatsappNotifications, 
      reminderDays,
      phoneNumber 
    } = req.body;

    const updateData = {};
    
    if (notificationsEnabled !== undefined) {
      updateData['preferences.notificationsEnabled'] = notificationsEnabled;
    }
    if (emailNotifications !== undefined) {
      updateData['preferences.emailNotifications'] = emailNotifications;
    }
    if (whatsappNotifications !== undefined) {
      updateData['preferences.whatsappNotifications'] = whatsappNotifications;
    }
    if (reminderDays !== undefined && Array.isArray(reminderDays)) {
      updateData['preferences.reminderDays'] = reminderDays;
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber || null;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: {
        notificationsEnabled: user.preferences.notificationsEnabled,
        emailNotifications: user.preferences.emailNotifications,
        whatsappNotifications: user.preferences.whatsappNotifications,
        reminderDays: user.preferences.reminderDays,
        phoneNumber: user.phoneNumber || null
      }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Error updating notification preferences' });
  }
});

// POST /api/notifications/test/email - Send test email
router.post('/test/email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.preferences.emailNotifications) {
      return res.status(400).json({ error: 'Email notifications are disabled' });
    }

    const success = await testEmail(user.email);
    
    if (success) {
      res.json({ message: 'Test email sent successfully! Check your inbox.' });
    } else {
      res.status(500).json({ error: 'Failed to send test email. Check server logs.' });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ error: 'Error sending test email' });
  }
});

// POST /api/notifications/test/whatsapp - Send test WhatsApp
router.post('/test/whatsapp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.phoneNumber) {
      return res.status(400).json({ error: 'Phone number not set' });
    }

    if (!user.preferences.whatsappNotifications) {
      return res.status(400).json({ error: 'WhatsApp notifications are disabled' });
    }

    const success = await testWhatsApp(user.phoneNumber);
    
    if (success) {
      res.json({ message: 'Test WhatsApp sent successfully! Check your messages.' });
    } else {
      res.status(500).json({ error: 'Failed to send test WhatsApp. Check server logs.' });
    }
  } catch (error) {
    console.error('Send test WhatsApp error:', error);
    res.status(500).json({ error: 'Error sending test WhatsApp message' });
  }
});

export default router;