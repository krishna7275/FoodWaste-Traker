import cron from 'node-cron';
import Item from '../models/Item.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';

// Function to create alerts for expiring items
const checkExpiringItems = async () => {
  try {
    console.log('🔔 Running expiry check job...');

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

            await Alert.create({
              userId: user._id,
              itemId: item._id,
              type: alertType,
              message,
              daysUntilExpiry,
              priority,
              sent: false,
              read: false
            });

            console.log(`✅ Alert created for user ${user.email}: ${message}`);
          }
        }
      }
    }

    console.log('✅ Expiry check job completed');
  } catch (error) {
    console.error('❌ Error in expiry check job:', error);
  }
};

// Function to start the cron job
export const startReminderJob = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    await checkExpiringItems();
  });

  console.log('⏰ Reminder cron job scheduled (runs daily at 8:00 AM)');

  // Run immediately on startup for testing
  setTimeout(() => {
    checkExpiringItems();
  }, 5000);
};