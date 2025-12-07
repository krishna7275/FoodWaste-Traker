import twilio from 'twilio';

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

// Format phone number for WhatsApp (E.164 format)
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 0, replace with country code (default to +1 for US)
  if (cleaned.startsWith('0')) {
    cleaned = '1' + cleaned.substring(1);
  }
  
  // If it doesn't start with country code, add +1 (US) or use env variable
  if (!cleaned.startsWith('1') && !cleaned.startsWith('91') && !cleaned.startsWith('44')) {
    const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '1';
    cleaned = defaultCountryCode + cleaned;
  }
  
  return '+' + cleaned;
};

// Send WhatsApp alert
export const sendWhatsAppAlert = async (user, item, daysUntilExpiry) => {
  try {
    if (!user.phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️  Twilio credentials not configured. Skipping WhatsApp notification.');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
    if (!fromNumber) {
      return { success: false, error: 'WhatsApp sender number not configured' };
    }

    const toNumber = formatPhoneNumber(user.phoneNumber);
    const whatsappTo = `whatsapp:${toNumber}`;

    let message;
    if (daysUntilExpiry === 0) {
      message = `🚨 *${item.name} expires TODAY!*\n\nYour item "${item.name}" expires today! Please use it soon to avoid waste.\n\n📅 Expiry: ${new Date(item.expiryDate).toLocaleDateString()}\n📦 Quantity: ${item.quantity} ${item.unit}\n\nVisit your dashboard for recipe suggestions!`;
    } else if (daysUntilExpiry < 0) {
      message = `⚠️ *${item.name} has expired*\n\nYour item "${item.name}" expired ${Math.abs(daysUntilExpiry)} day(s) ago.\n\n📅 Expiry: ${new Date(item.expiryDate).toLocaleDateString()}\n\nPlease check your dashboard to manage expired items.`;
    } else if (daysUntilExpiry === 1) {
      message = `⏰ *${item.name} expires tomorrow*\n\nYour item "${item.name}" expires tomorrow. Don't forget to use it!\n\n📅 Expiry: ${new Date(item.expiryDate).toLocaleDateString()}\n📦 Quantity: ${item.quantity} ${item.unit}\n\nVisit your dashboard for recipe suggestions!`;
    } else {
      message = `📅 *${item.name} expires in ${daysUntilExpiry} days*\n\nYour item "${item.name}" will expire in ${daysUntilExpiry} days. Plan to use it soon!\n\n📅 Expiry: ${new Date(item.expiryDate).toLocaleDateString()}\n📦 Quantity: ${item.quantity} ${item.unit}\n\nVisit your dashboard for recipe suggestions!`;
    }

    const result = await client.messages.create({
      from: fromNumber,
      to: whatsappTo,
      body: message
    });

    console.log(`✅ WhatsApp sent to ${toNumber}:`, result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

// Send test WhatsApp message
export const sendTestWhatsApp = async (user) => {
  try {
    if (!user.phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    const client = getTwilioClient();
    if (!client) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
      return { success: false, error: 'WhatsApp sender number not configured' };
    }

    const toNumber = formatPhoneNumber(user.phoneNumber);
    const whatsappTo = `whatsapp:${toNumber}`;

    const message = `✅ *WhatsApp Notifications Test*\n\nHello ${user.name}!\n\nThis is a test message to confirm that WhatsApp notifications are working correctly.\n\nYou will receive alerts when your food items are about to expire.`;

    const result = await client.messages.create({
      from: fromNumber,
      to: whatsappTo,
      body: message
    });

    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('Error sending test WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

