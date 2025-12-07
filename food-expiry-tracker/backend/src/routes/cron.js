import express from 'express';
import { sendReminderNotifications } from '../jobs/reminderJob.js';

const router = express.Router();

// This endpoint is protected by a secret to prevent unauthorized execution.
// Vercel will send the secret in the 'x-vercel-cron-secret' header.
router.post('/run-reminders', async (req, res) => {
  // For Vercel deployments
  const vercelCronSecret = req.headers['x-vercel-cron-secret'];
  // For local testing via tools like Postman
  const authorizationHeader = req.headers.authorization;

  if (vercelCronSecret !== process.env.CRON_SECRET && authorizationHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('⏰ Running scheduled reminder job via API...');
    await sendReminderNotifications();
    res.status(200).json({ success: true, message: 'Reminder job executed successfully.' });
  } catch (error) {
    console.error('❌ Error running reminder job via API:', error);
    res.status(500).json({ success: false, message: 'An error occurred during the reminder job.' });
  }
});

export default router;