// Email service using SendGrid or AWS SES
import { config } from '../config/env';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static provider: 'sendgrid' | 'ses' | 'smtp' | 'console' =
    (process.env.EMAIL_PROVIDER as any) || 'console';
  private static sendGridApiKey = process.env.SENDGRID_API_KEY || '';
  private static sesRegion = process.env.AWS_SES_REGION || 'us-east-1';
  private static sesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID || '';
  private static sesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY || '';
  private static smtpHost = process.env.SMTP_HOST || '';
  private static smtpPort = parseInt(process.env.SMTP_PORT || '587');
  private static smtpUser = process.env.SMTP_USER || '';
  private static smtpPassword = process.env.SMTP_PASSWORD || '';
  private static fromEmail = process.env.FROM_EMAIL || 'noreply@farmsync.com';
  private static fromName = process.env.FROM_NAME || 'FarmSync';

  /**
   * Send email using configured provider
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'ses':
          return await this.sendWithSES(options);
        case 'smtp':
          return await this.sendWithSMTP(options);
        case 'console':
        default:
          return await this.sendToConsole(options);
      }
    } catch (error: any) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send email using SendGrid
   */
  private static async sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
    if (!this.sendGridApiKey) {
      throw new Error('SendGrid API key not configured');
    }

    try {
      const { default: sgMail } = await import('@sendgrid/mail');
      sgMail.setApiKey(this.sendGridApiKey);

      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: options.from || `${this.fromName} <${this.fromEmail}>`,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        html: options.html,
      };

      const response = await sgMail.send(msg);
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string,
      };
    } catch (error: any) {
      throw new Error(`SendGrid error: ${error.message}`);
    }
  }

  /**
   * Send email using AWS SES
   */
  private static async sendWithSES(options: EmailOptions): Promise<EmailResult> {
    if (!this.sesAccessKeyId || !this.sesSecretAccessKey) {
      throw new Error('AWS SES credentials not configured');
    }

    try {
      const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
      
      const sesClient = new SESClient({
        region: this.sesRegion,
        credentials: {
          accessKeyId: this.sesAccessKeyId,
          secretAccessKey: this.sesSecretAccessKey,
        },
      });

      const command = new SendEmailCommand({
        Source: options.from || `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: options.text || options.html.replace(/<[^>]*>/g, ''),
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await sesClient.send(command);
      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error: any) {
      throw new Error(`AWS SES error: ${error.message}`);
    }
  }

  /**
   * Send email using SMTP (Nodemailer)
   */
  private static async sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
    if (!this.smtpHost || !this.smtpUser || !this.smtpPassword) {
      throw new Error('SMTP credentials not configured');
    }

    try {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPassword,
        },
      });

      const info = await transporter.sendMail({
        from: options.from || `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
        html: options.html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      throw new Error(`SMTP error: ${error.message}`);
    }
  }

  /**
   * Fallback: Log email to console (for development)
   */
  private static async sendToConsole(options: EmailOptions): Promise<EmailResult> {
    console.log('\n========== EMAIL (Console Mode) ==========');
    console.log('To:', Array.isArray(options.to) ? options.to.join(', ') : options.to);
    console.log('From:', options.from || `${this.fromName} <${this.fromEmail}>`);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text || options.html.replace(/<[^>]*>/g, ''));
    console.log('==========================================\n');
    
    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  /**
   * Send climate alert email
   */
  static async sendClimateAlert(email: string, alert: { type: string; severity: string; message: string; recommendation: string }): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert { background: ${alert.severity === 'critical' ? '#fee2e2' : alert.severity === 'high' ? '#fed7aa' : '#fef3c7'}; 
                     padding: 15px; border-left: 4px solid ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#d97706'}; 
                     margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 FarmSync Climate Alert</h1>
            </div>
            <div class="content">
              <h2>${alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert</h2>
              <div class="alert">
                <strong>Severity:</strong> ${alert.severity.toUpperCase()}<br/>
                <strong>Message:</strong> ${alert.message}<br/>
                <strong>Recommendation:</strong> ${alert.recommendation}
              </div>
              <p>Please take appropriate action based on this climate alert for your farm.</p>
              <div class="footer">
                <p>This is an automated alert from FarmSync - Digital Farm Record Management System</p>
                <p>You can manage your alert preferences in your account settings.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `⚠️ Climate Alert: ${alert.type.replace(/_/g, ' ')} - ${alert.severity.toUpperCase()}`,
      html,
    });
  }

  /**
   * Send low stock alert email
   */
  static async sendLowStockAlert(email: string, item: { name: string; category: string; quantity: number; unit: string; threshold: number }): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert { background: #fef3c7; padding: 15px; border-left: 4px solid #d97706; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 FarmSync Low Stock Alert</h1>
            </div>
            <div class="content">
              <h2>Low Stock Warning</h2>
              <div class="alert">
                <strong>Item:</strong> ${item.name}<br/>
                <strong>Category:</strong> ${item.category}<br/>
                <strong>Current Stock:</strong> ${item.quantity} ${item.unit}<br/>
                <strong>Threshold:</strong> ${item.threshold} ${item.unit}
              </div>
              <p>Your stock level for <strong>${item.name}</strong> is running low. Please consider restocking soon.</p>
              <div class="footer">
                <p>This is an automated alert from FarmSync - Digital Farm Record Management System</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📦 Low Stock Alert: ${item.name}`,
      html,
    });
  }

  /**
   * Send harvest reminder email
   */
  static async sendHarvestReminder(email: string, crop: { name: string; expectedHarvestDate: string; daysUntilHarvest: number }): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .reminder { background: #dcfce7; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 FarmSync Harvest Reminder</h1>
            </div>
            <div class="content">
              <h2>Upcoming Harvest Window</h2>
              <div class="reminder">
                <strong>Crop:</strong> ${crop.name}<br/>
                <strong>Expected Harvest Date:</strong> ${crop.expectedHarvestDate}<br/>
                <strong>Days Until Harvest:</strong> ${crop.daysUntilHarvest} days
              </div>
              <p>Your <strong>${crop.name}</strong> crop is approaching its harvest window. Please prepare accordingly.</p>
              <div class="footer">
                <p>This is an automated reminder from FarmSync - Digital Farm Record Management System</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `🌾 Harvest Reminder: ${crop.name} - ${crop.daysUntilHarvest} days remaining`,
      html,
    });
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email: string, name: string, role: string): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .welcome-box { background: #dcfce7; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Welcome to FarmSync!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for creating your FarmSync account. We're excited to have you on board!</p>
              
              <div class="welcome-box">
                <h3>Your Account Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              </div>

              <p>Your FarmSync account has been successfully created. You can now:</p>
              <ul>
                <li>Manage your farm records and crops</li>
                <li>Track expenses and yields</li>
                <li>Get crop recommendations</li>
                <li>Monitor weather and climate alerts</li>
                <li>Generate reports and analytics</li>
              </ul>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
              </p>

              <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>

              <div class="footer">
                <p><strong>FarmSync</strong> - Digital Farm Record Management System</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🌾 Welcome to FarmSync - Your Account Has Been Created!',
      html,
    });
  }
}
