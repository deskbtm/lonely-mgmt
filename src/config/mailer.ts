import { registerAs } from '@nestjs/config';
export default registerAs('mailer', () => ({
  user: process.env.MAILER_NAME,
  pwd: process.env.MAILER_PASSWORD,
  port: process.env.MAILER_PORT,
}));
