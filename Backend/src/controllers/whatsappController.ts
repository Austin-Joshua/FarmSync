import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/whatsapp/send
 * Send WhatsApp message
 */
export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, message, type } = req.body;

    if (!to || !message) {
      throw new AppError('Phone number and message are required', 400);
    }

    await whatsappService.sendMessage(to, message, type || 'text');

    res.json({
      message: 'WhatsApp message sent successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/whatsapp/webhook
 * Verify WhatsApp webhook
 */
export const verifyWebhook = async (req: Request, res: Response): Promise<void> => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const result = whatsappService.verifyWebhook(mode, token, challenge);

  if (result) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
};

/**
 * POST /api/whatsapp/webhook
 * Receive WhatsApp messages
 */
export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        const from = message.from;
        const text = message.text?.body;

        // Process incoming message
        const response = await whatsappService.processIncomingMessage(message);

        // Send response (in production, you'd queue this)
        // await whatsappService.sendMessage(from, response);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(200).send('OK'); // Always return 200 to WhatsApp
  }
};
