import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendSMSNotification(to: string, message: string): Promise<boolean> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured - SMS notification skipped');
    return false;
  }

  try {
    // Clean and format phone number
    const cleanPhone = to.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('27') ? `+${cleanPhone}` : 
                          cleanPhone.startsWith('0') ? `+27${cleanPhone.slice(1)}` :
                          `+27${cleanPhone}`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export function createParcelNotificationMessage(
  trackingNumber: string,
  status: string,
  recipientName: string,
  location?: string
): string {
  const statusMessages = {
    collected: `Hi ${recipientName}, your parcel ${trackingNumber} has been collected and is now in transit via RapidTransit.`,
    in_transit: `Update: Your parcel ${trackingNumber} is currently in transit${location ? ` at ${location}` : ''}. Track: rapidtransit.app/track/${trackingNumber}`,
    out_for_delivery: `Great news ${recipientName}! Your parcel ${trackingNumber} is out for delivery and will arrive shortly.`,
    delivered: `Delivered! Your parcel ${trackingNumber} has been successfully delivered. Thank you for using RapidTransit!`,
    delayed: `Update: Your parcel ${trackingNumber} is experiencing a slight delay${location ? ` at ${location}` : ''}. We'll keep you updated.`,
  };

  return statusMessages[status as keyof typeof statusMessages] || 
    `Update on your parcel ${trackingNumber}: Status changed to ${status}. Track: rapidtransit.app/track/${trackingNumber}`;
}