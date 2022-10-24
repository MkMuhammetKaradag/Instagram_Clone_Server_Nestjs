import { config } from 'dotenv';

config({ path: `.env` });

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  SESSION_SECRET,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  FRONTEND_URL,
  // AWS_ACCESS_KEY_ID,
  // AWS_S3_BUCKET,
  // AWS_SECRET_ACCESS_KEY,
  // AWS_S3_REGION,
} = process.env;
