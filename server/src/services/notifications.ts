import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { AcknowledgementMethod } from '@prisma/client';
import prisma from '../lib/prisma';
const qrcode = require('qrcode-terminal');

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Twilio configuration (for SMS)
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// WhatsApp client
let whatsappClient: Client | null = null;
let whatsappReady = false;

if (process.env.ENABLE_WHATSAPP === 'true') {
  whatsappClient = new Client({
    authStrategy: new LocalAuth()
  });

  whatsappClient.on('qr', (qr) => {
    console.log('WhatsApp QR Code:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
    whatsappReady = true;
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated!');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
  });

  whatsappClient.initialize().catch((error) => {
    console.error('Error initializing WhatsApp client:', error);
  });
}

export interface NotificationResult {
  success: boolean;
  method: AcknowledgementMethod;
  error?: string;
}

/**
 * Send email notification
 */
export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  reminderId: string
): Promise<NotificationResult> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return {
      success: false,
      method: AcknowledgementMethod.EMAIL,
      error: 'Email service not configured'
    };
  }

  try {
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/acknowledge/${reminderId}?method=EMAIL">
              Click here to acknowledge
            </a>
          </p>
        </div>
      `,
      text: `${subject}\n\n${message}\n\nAcknowledge at: ${process.env.APP_URL || 'http://localhost:3000'}/acknowledge/${reminderId}?method=EMAIL`
    });

    // Record acknowledgment
    await prisma.acknowledgement.create({
      data: {
        reminderId,
        method: AcknowledgementMethod.EMAIL,
        notes: `Email sent to ${to}. MessageId: ${info.messageId}`
      }
    });

    return {
      success: true,
      method: AcknowledgementMethod.EMAIL
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      method: AcknowledgementMethod.EMAIL,
      error: error.message
    };
  }
}

/**
 * Send SMS notification
 */
export async function sendSMS(
  to: string,
  message: string,
  reminderId: string
): Promise<NotificationResult> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return {
      success: false,
      method: AcknowledgementMethod.SMS,
      error: 'SMS service not configured'
    };
  }

  try {
    const twilioMessage = await twilioClient.messages.create({
      body: `${message}\n\nAcknowledge: ${process.env.APP_URL || 'http://localhost:3000'}/acknowledge/${reminderId}?method=SMS`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    // Record acknowledgment
    await prisma.acknowledgement.create({
      data: {
        reminderId,
        method: AcknowledgementMethod.SMS,
        notes: `SMS sent to ${to}. SID: ${twilioMessage.sid}`
      }
    });

    return {
      success: true,
      method: AcknowledgementMethod.SMS
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      method: AcknowledgementMethod.SMS,
      error: error.message
    };
  }
}

/**
 * Send WhatsApp notification
 */
export async function sendWhatsApp(
  to: string,
  message: string,
  reminderId: string
): Promise<NotificationResult> {
  if (!whatsappClient || !whatsappReady) {
    return {
      success: false,
      method: AcknowledgementMethod.WHATSAPP,
      error: 'WhatsApp service not ready'
    };
  }

  try {
    // Format phone number (remove + and ensure country code)
    const formattedNumber = to.replace(/[^\d]/g, '');
    const chatId = `${formattedNumber}@c.us`;

    const fullMessage = `${message}\n\nAcknowledge: ${process.env.APP_URL || 'http://localhost:3000'}/acknowledge/${reminderId}?method=WHATSAPP`;

    await whatsappClient.sendMessage(chatId, fullMessage);

    // Record acknowledgment
    await prisma.acknowledgement.create({
      data: {
        reminderId,
        method: AcknowledgementMethod.WHATSAPP,
        notes: `WhatsApp sent to ${to}`
      }
    });

    return {
      success: true,
      method: AcknowledgementMethod.WHATSAPP
    };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      method: AcknowledgementMethod.WHATSAPP,
      error: error.message
    };
  }
}

/**
 * Send notification to a member through all available channels
 */
export async function sendNotificationToMember(
  member: { email?: string | null; phone?: string | null; whatsapp?: string | null },
  subject: string,
  message: string,
  reminderId: string,
  channels: ('email' | 'sms' | 'whatsapp')[] = ['email', 'sms', 'whatsapp']
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  // Send email
  if (channels.includes('email') && member.email) {
    const emailResult = await sendEmail(member.email, subject, message, reminderId);
    results.push(emailResult);
  }

  // Send SMS
  if (channels.includes('sms') && member.phone) {
    const smsResult = await sendSMS(member.phone, message, reminderId);
    results.push(smsResult);
  }

  // Send WhatsApp
  if (channels.includes('whatsapp') && member.whatsapp) {
    const whatsappResult = await sendWhatsApp(member.whatsapp, message, reminderId);
    results.push(whatsappResult);
  }

  return results;
}

