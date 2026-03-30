import twilio from 'twilio';
import { AppError } from '../middleware/errorHandler';

export interface SMSMessage {
  to: string;
  message: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not configured. SMS features will be limited.');
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      console.warn('SMS service not configured. Message would be sent to:', to, message);
      return;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to),
      });
    } catch (error: any) {
      console.error('SMS send error:', error.message);
      throw new AppError(`Failed to send SMS: ${error.message}`, 500);
    }
  }

  /**
   * Send weather alert via SMS
   */
  async sendWeatherAlertSMS(to: string, alert: {
    type: string;
    severity: string;
    message: string;
  }): Promise<void> {
    const message = `FarmSync Alert: ${alert.type} - ${alert.severity} severity. ${alert.message}`;
    await this.sendSMS(to, message);
  }

  /**
   * Send low stock alert via SMS
   */
  async sendLowStockAlertSMS(to: string, itemName: string, quantity: number, unit: string): Promise<void> {
    const message = `FarmSync: Low stock alert! ${itemName} is running low (${quantity} ${unit}). Please restock soon.`;
    await this.sendSMS(to, message);
  }

  /**
   * Send harvest reminder via SMS
   */
  async sendHarvestReminderSMS(to: string, cropName: string, harvestDate: string): Promise<void> {
    const message = `FarmSync: Harvest reminder! ${cropName} is ready for harvest on ${harvestDate}. Plan your activities accordingly.`;
    await this.sendSMS(to, message);
  }

  /**
   * Format phone number for SMS (E.164 format)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If doesn't start with country code, assume India (+91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    // Add + prefix
    return '+' + cleaned;
  }
}

export default new SMSService();
