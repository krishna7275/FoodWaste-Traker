import cron from 'node-cron';
import Item from '../models/Item.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import {
  sendEmailNotification,
  sendWhatsAppNotification,
} from '../services/notificationService.js';

// Function to create alerts for expiring items
const checkAndCreateAlerts = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get all active users
    const users = await User.find({ 'preferences.notificationsEnabled': true });

    for (const user of users) {
      const reminderDays = user.preferences.reminderDays || [7, 3, 1];

      // Get all items for this user that aren't consumed
      const items = await Item.find({
        userId: user._id,
        status: { $ne: 'consumed' }
      });

      for (const item of items) {
        const expiryDate = new Date(item.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        // Update item status
        item.updateStatus();
        await item.save();

        // Check if we should create an alert
        if (reminderDays.includes(daysUntilExpiry)) {
          // Check if alert already exists for this day
          const existingAlert = await Alert.findOne({
            userId: user._id,
            itemId: item._id,
            daysUntilExpiry,
            triggerDate: { $gte: now }
          });

          if (!existingAlert) {
            const alertType = daysUntilExpiry <= 0 ? 'expired' : 'expiring_soon';
            const priority = daysUntilExpiry <= 1 ? 'high' : daysUntilExpiry <= 3 ? 'medium' : 'low';

            let message;
            if (daysUntilExpiry === 0) {
              message = `${item.name} expires today!`;
            } else if (daysUntilExpiry < 0) {
              message = `${item.name} expired ${Math.abs(daysUntilExpiry)} day(s) ago`;
            } else if (daysUntilExpiry === 1) {
              message = `${item.name} expires tomorrow`;
            } else {
              message = `${item.name} expires in ${daysUntilExpiry} days`;
            }

            const alert = await Alert.create({
              userId: user._id,
              itemId: item._id,
              type: alertType,
              message,
              daysUntilExpiry,
              priority,
              sent: false,
              read: false
            });

            console.log(`✅ Alert created for ${item.name} for user ${user.email}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in expiry check job:', error);
  }
};

// Function to start the cron job
export const startReminderJob = () => {
  // Schedule to run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Running daily expiry check and notification job...');
    await checkAndCreateAlerts();
    await sendReminderNotifications();
  });

  console.log('⏰ Cron job scheduled to run daily at 8:00 AM.');

  // For development: run once on startup after a short delay
  setTimeout(() => {
    console.log('🚀 Running initial job on startup...');
    checkAndCreateAlerts();
    sendReminderNotifications();
  }, 5000);
};

// This function finds expiring items and sends notifications. It's exported to be used by the cron API endpoint.
export const sendReminderNotifications = async () => {
  try {
    console.log('📤 Checking for unsent alerts to notify users...');
    const unsentAlerts = await Alert.find({ sent: false }).populate('userId').populate('itemId');

    for (const alert of unsentAlerts) {
      const user = alert.userId;
      const item = alert.itemId;

      if (!user || !item) {
        console.log(`Skipping alert ${alert._id} due to missing user or item.`);
        continue;
      }

      const notificationPromises = [];

      // Send email notification
      if (user.preferences.emailNotifications && user.preferences.notificationsEnabled) {
        notificationPromises.push(
          sendEmailNotification(user.email, `⏰ ${alert.message}`, {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'pieces',
            category: item.category || 'Uncategorized',
            expiryDate: item.expiryDate,
            status: alert.message,
          }).then(success => {
            if (success) alert.emailSent = true;
            return success;
          })
        );
      }

      // Send WhatsApp notification
      if (user.preferences.whatsappNotifications && user.preferences.notificationsEnabled && user.phoneNumber) {
        notificationPromises.push(
          sendWhatsAppNotification(user.phoneNumber, {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'pieces',
            category: item.category || 'Uncategorized',
            expiryDate: item.expiryDate,
            status: alert.message,
          }).then(success => {
            if (success) alert.whatsappSent = true;
            return success;
          })
        );
      }

      await Promise.allSettled(notificationPromises);
      alert.sent = alert.emailSent || alert.whatsappSent;
      await alert.save();
      console.log(`📤 Processed notifications for alert ${alert._id}`);
    }
  } catch (error) {
    console.error('❌ Error sending reminder notifications:', error);
  }
};