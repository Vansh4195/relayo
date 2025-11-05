import twilio from 'twilio';
import { prisma } from './prisma';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;

/**
 * Get Twilio client for a specific workspace integration
 */
export async function getTwilioClient(integrationId: string) {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId, provider: 'TWILIO' },
  });

  if (!integration || !integration.twilioSid || !integration.twilioAuthToken) {
    throw new Error('Twilio integration not configured');
  }

  return twilio(integration.twilioSid, integration.twilioAuthToken);
}

export interface SendSmsInput {
  to: string;
  body: string;
  from?: string;
}

/**
 * Send an SMS message
 */
export async function sendSms(integrationId: string, input: SendSmsInput) {
  const client = await getTwilioClient(integrationId);

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  const message = await client.messages.create({
    to: input.to,
    from: input.from || integration?.twilioFromNumber!,
    body: input.body,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
  };
}

/**
 * Verify Twilio webhook signature
 */
export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  const webhookSecret = process.env.TWILIO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('TWILIO_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }

  return twilio.validateRequest(webhookSecret, signature, url, params);
}
