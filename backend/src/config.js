import 'dotenv/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const backendDir = join(here, '..');

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongodb: {
    uri: (process.env.MONGODB_URI ?? process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/omniflow')
      .replace(/^(MONGODB_URI|MONGO_URI)\s*=\s*/i, '')
      .trim()
      .replace(/^['"]|['"]$/g, ''),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'omniflow-development-secret-key-32chars',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER ?? 'whatsapp:+14155238886',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
  },
};
