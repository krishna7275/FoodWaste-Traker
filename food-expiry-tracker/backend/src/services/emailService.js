import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // For production, use SMTP settings from environment variables
  // For development/testing, you can use Gmail or other services
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
    }
  });
};

// Send expiry alert email
export const sendExpiryAlert = async (user, item, daysUntilExpiry) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email credentials not configured. Skipping email notification.');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();

    let subject, message;
    if (daysUntilExpiry === 0) {
      subject = `🚨 ${item.name} expires TODAY!`;
      message = `Your item "${item.name}" expires today! Please use it soon to avoid waste.`;
    } else if (daysUntilExpiry < 0) {
      subject = `⚠️ ${item.name} has expired`;
      message = `Your item "${item.name}" expired ${Math.abs(daysUntilExpiry)} day(s) ago.`;
    } else if (daysUntilExpiry === 1) {
      subject = `⏰ ${item.name} expires tomorrow`;
      message = `Your item "${item.name}" expires tomorrow. Don't forget to use it!`;
    } else {
      subject = `📅 ${item.name} expires in ${daysUntilExpiry} days`;
      message = `Your item "${item.name}" will expire in ${daysUntilExpiry} days. Plan to use it soon!`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1A73E8 0%, #34A853 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .item-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #1A73E8; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 FoodWaste Tracker Alert</h1>
            </div>
            <div class="content">
              <h2>${subject}</h2>
              <p>Hello ${user.name},</p>
              <p>${message}</p>
              
              <div class="item-card">
                <h3>Item Details:</h3>
                <p><strong>Name:</strong> ${item.name}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Quantity:</strong> ${item.quantity} ${item.unit}</p>
                <p><strong>Expiry Date:</strong> ${new Date(item.expiryDate).toLocaleDateString()}</p>
                ${item.estimatedPrice ? `<p><strong>Estimated Price:</strong> $${item.estimatedPrice}</p>` : ''}
              </div>

              <p>Visit your dashboard to see all expiring items and get recipe suggestions!</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">View Dashboard</a>
              
              <div class="footer">
                <p>This is an automated notification from FoodWaste Tracker.</p>
                <p>You can manage your notification preferences in Settings.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"FoodWaste Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      text: message,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${user.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send test email
export const sendTestEmail = async (user) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"FoodWaste Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Email Notifications Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Notifications Working! ✅</h2>
          <p>Hello ${user.name},</p>
          <p>This is a test email to confirm that email notifications are working correctly.</p>
          <p>You will receive alerts when your food items are about to expire.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

