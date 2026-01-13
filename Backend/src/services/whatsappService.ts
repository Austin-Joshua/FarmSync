import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'template';
}

export class WhatsAppService {
  private apiKey: string;
  private apiUrl: string;
  private phoneNumberId: string;

  constructor() {
    // WhatsApp Business API configuration
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    if (!this.apiKey || !this.phoneNumberId) {
      console.warn('WhatsApp API credentials not configured. WhatsApp features will be limited.');
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(to: string, message: string, type: 'text' | 'template' = 'text'): Promise<void> {
    if (!this.apiKey || !this.phoneNumberId) {
      console.warn('WhatsApp API not configured. Message would be sent to:', to, message);
      return;
    }

    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: type,
        [type === 'text' ? 'text' : 'template']: type === 'text' 
          ? { body: message }
          : { name: message, language: { code: 'en' } },
      };

      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      throw new AppError(`Failed to send WhatsApp message: ${error.message}`, 500);
    }
  }

  /**
   * Send weather alert via WhatsApp
   */
  async sendWeatherAlert(to: string, alert: {
    type: string;
    severity: string;
    message: string;
    recommendation?: string;
  }): Promise<void> {
    const message = `🌦️ *Weather Alert*\n\n` +
      `Type: ${alert.type}\n` +
      `Severity: ${alert.severity}\n` +
      `Message: ${alert.message}\n` +
      (alert.recommendation ? `\n💡 Recommendation: ${alert.recommendation}` : '');

    await this.sendMessage(to, message);
  }

  /**
   * Send low stock alert via WhatsApp
   */
  async sendLowStockAlert(to: string, items: Array<{ name: string; quantity: number; unit: string }>): Promise<void> {
    const itemsList = items.map(item => `• ${item.name}: ${item.quantity} ${item.unit}`).join('\n');
    const message = `⚠️ *Low Stock Alert*\n\n` +
      `The following items are running low:\n\n${itemsList}\n\n` +
      `Please restock soon to avoid stockouts.`;

    await this.sendMessage(to, message);
  }

  /**
   * Send harvest reminder via WhatsApp
   */
  async sendHarvestReminder(to: string, crop: { name: string; harvestDate: string }): Promise<void> {
    const message = `🌾 *Harvest Reminder*\n\n` +
      `Your crop "${crop.name}" is ready for harvest!\n` +
      `Expected harvest date: ${crop.harvestDate}\n\n` +
      `Plan your harvest activities accordingly.`;

    await this.sendMessage(to, message);
  }

  /**
   * Send irrigation reminder via WhatsApp
   */
  async sendIrrigationReminder(to: string, field: { name: string; lastIrrigation?: string }): Promise<void> {
    const message = `💧 *Irrigation Reminder*\n\n` +
      `Field: ${field.name}\n` +
      (field.lastIrrigation ? `Last irrigation: ${field.lastIrrigation}\n` : '') +
      `\nTime to irrigate your field!`;

    await this.sendMessage(to, message);
  }

  /**
   * Format phone number for WhatsApp (remove +, spaces, etc.)
   */
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  /**
   * Verify WhatsApp webhook (for receiving messages)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'farmsync_verify_token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Process incoming WhatsApp message
   */
  async processIncomingMessage(message: any): Promise<string> {
    // Simple chatbot logic - can be enhanced with Dialogflow
    const text = message.text?.body?.toLowerCase() || '';
    
    if (text.includes('hello') || text.includes('hi')) {
      return 'Hello! Welcome to FarmSync. How can I help you today?';
    }
    
    if (text.includes('weather')) {
      return 'To check weather, please use the FarmSync app or website. I can send you weather alerts!';
    }
    
    if (text.includes('stock') || text.includes('inventory')) {
      return 'To check stock levels, please log in to FarmSync app. I can alert you when stock is low!';
    }
    
    if (text.includes('help')) {
      return 'FarmSync Help:\n' +
        '• Check weather alerts\n' +
        '• View stock levels\n' +
        '• Get harvest reminders\n' +
        '• Track expenses\n\n' +
        'For more features, use the FarmSync app!';
    }
    
    return 'Thank you for your message! For detailed features, please use the FarmSync app or visit our website.';
  }
}

export default new WhatsAppService();
