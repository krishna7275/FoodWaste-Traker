import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize Email Transporter
let emailTransporter;

const initializeEmailTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.SMTP_HOST) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
};

initializeEmailTransporter();

// Send Email Notification
export const sendEmailNotification = async (to, subject, itemDetails) => {
  if (!emailTransporter) {
    console.warn('⚠️  Email transporter not configured');
    return false;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">⏰ Food Expiry Alert</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Item:</strong> ${itemDetails.name}</p>
          <p><strong>Quantity:</strong> ${itemDetails.quantity} ${itemDetails.unit}</p>
          <p><strong>Category:</strong> ${itemDetails.category}</p>
          <p><strong>Expires:</strong> ${new Date(itemDetails.expiryDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="color: #ff6b6b; font-weight: bold;">${itemDetails.status}</span></p>
        </div>

        <p style="color: #666; margin: 20px 0;">
          Don't let food go to waste! Check your dashboard to view recipes and use these ingredients before they expire.
        </p>

        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Dashboard
        </a>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">FoodWaste Tracker - Reducing Food Waste Together</p>
      </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@foodwastetracker.com',
      to,
      subject,
      html: htmlContent,
    });

    console.log('✅ Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
};

// Send WhatsApp Notification
export const sendWhatsAppNotification = async (phoneNumber, itemDetails) => {
  if (!twilioClient) {
    console.warn('⚠️  Twilio not configured');
    return false;
  }

  try {
    const messageBody = `🔔 *FoodWaste Tracker Alert*

*Item:* ${itemDetails.name}
*Quantity:* ${itemDetails.quantity} ${itemDetails.unit}
*Category:* ${itemDetails.category}
*Expires:* ${new Date(itemDetails.expiryDate).toLocaleDateString()}
*Status:* ${itemDetails.status}

Don't let food go to waste! Check recipes on the dashboard.`;

    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phoneNumber}`,
      body: messageBody,
    });

    console.log('✅ WhatsApp sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('❌ WhatsApp sending error:', error);
    return false;
  }
};

// Test Email
export const testEmail = async (email) => {
  return sendEmailNotification(
    email,
    '🧪 Test Email - FoodWaste Tracker',
    {
      name: 'Test Item',
      quantity: 1,
      unit: 'piece',
      category: 'Test',
      expiryDate: new Date(),
      status: 'Test Alert',
    }
  );
};

// Test WhatsApp
export const testWhatsApp = async (phoneNumber) => {
  return sendWhatsAppNotification(phoneNumber, {
    name: 'Test Item',
    quantity: 1,
    unit: 'piece',
    category: 'Test',
    expiryDate: new Date(),
    status: 'Test Alert',
  });
};
